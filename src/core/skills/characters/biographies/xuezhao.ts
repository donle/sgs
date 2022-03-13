import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xuezhao', description: 'xuezhao_description' })
export class XueZhao extends ActiveSkill {
  public static readonly XueZhaoTargets = 'xuezhao_targets';

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0 && owner.Hp > 0;
  }

  public numberOfTargets() {
    return [];
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length > 0 && targets.length <= owner.Hp;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, fromId, fromId, this.Name);

    for (const toId of event.toIds) {
      if (room.getPlayerById(toId).getPlayerCards().length === 0) {
        continue;
      }

      const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you need to give a handcard to {1}, otherwise you cannot response the card {1} use',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        toId,
      );

      if (selectedCards.length > 0) {
        await room.moveCards({
          movingCards: [{ card: selectedCards[0], fromArea: room.getPlayerById(toId).cardFrom(selectedCards[0]) }],
          fromId: toId,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: toId,
          triggeredBySkills: [this.Name],
        });

        await room.drawCards(1, toId, 'top', toId, this.Name);

        const slashTimes = room.getFlag<number>(fromId, this.Name) || 0;
        room.setFlag<number>(fromId, this.Name, slashTimes + 1);
      } else {
        const targets = room.getFlag<PlayerId[]>(fromId, XueZhao.XueZhaoTargets) || [];
        targets.includes(toId) || targets.push(toId);
        room.getPlayerById(fromId).setFlag<PlayerId[]>(XueZhao.XueZhaoTargets, targets);

        room.setFlag<boolean>(toId, XueZhaoShadow.Name, true, this.Name);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XueZhao.Name, description: XueZhao.Description })
export class XueZhaoBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<number>(owner.Id, this.GeneralName)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return room.getFlag<number>(owner.Id, this.GeneralName);
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XueZhaoBuff.Name, description: XueZhaoBuff.Description })
export class XueZhaoShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      return (
        owner.getFlag<PlayerId[]>(XueZhao.XueZhaoTargets) !== undefined &&
        (event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId === owner.Id
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        (owner.getFlag<number>(this.GeneralName) !== undefined ||
          owner.getFlag<PlayerId[]>(XueZhao.XueZhaoTargets) !== undefined) &&
        phaseChangeEvent.fromPlayer === owner.Id &&
        phaseChangeEvent.from === PlayerPhase.PhaseFinish
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      cardUseEvent.disresponsiveList = room.getFlag<PlayerId[]>(event.fromId, XueZhao.XueZhaoTargets);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
      room.removeFlag(event.fromId, XueZhao.XueZhaoTargets);
      for (const player of room.getOtherPlayers(event.fromId)) {
        player.getFlag<boolean>(this.Name) && room.removeFlag(player.Id, this.Name);
      }
    }

    return true;
  }
}
