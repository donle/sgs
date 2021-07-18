import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'duoji', description: 'duoji_description' })
export class DuoJi extends ActiveSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, owner: Player) {
    for (const player of room.getAlivePlayersFrom()) {
      const ji = player.getCardIds(PlayerCardsArea.OutsideArea, this.Name);
      if (ji.length > 0) {
        await room.moveCards({
          movingCards: ji.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
          fromId: player.Id,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
          proposer: player.Id,
          triggeredBySkills: [this.Name],
        });
      }
    }
  }

  public async whenDead(room: Room, owner: Player) {
    for (const player of room.getAlivePlayersFrom()) {
      const ji = player.getCardIds(PlayerCardsArea.OutsideArea, this.Name);
      if (ji.length > 0) {
        await room.moveCards({
          movingCards: ji.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
          fromId: player.Id,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
          proposer: player.Id,
          triggeredBySkills: [this.Name],
        });
      }
    }
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: cardIds[0], fromArea: room.getPlayerById(fromId).cardFrom(cardIds[0]) }],
      fromId,
      toId: toIds[0],
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: true,
      proposer: fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: DuoJi.Name, description: DuoJi.Description })
export class DuoJiShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUseFinishedEffect || stage === PhaseChangeStage.BeforePhaseChange;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const from = room.getPlayerById(cardUseEvent.fromId);
      return (
        from.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0 &&
        Sanguosha.getCardById(cardUseEvent.cardId).is(CardType.Equip) &&
        from.getCardIds(PlayerCardsArea.EquipArea).includes(cardUseEvent.cardId)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      if (!phaseChangeEvent.fromPlayer) {
        return false;
      }

      return (
        room.getPlayerById(phaseChangeEvent.fromPlayer).getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName)
          .length > 0 && phaseChangeEvent.from === PlayerPhase.PhaseFinish
      );
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const user = room.getPlayerById(cardUseEvent.fromId);

      const ji = user.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
          cardAmount: 1,
          toId: cardUseEvent.fromId,
          reason: this.GeneralName,
          conversation: TranslationPack.translationJsonPatcher('{0}: please remove a Ji', this.GeneralName).extract(),
          fromArea: [PlayerCardsArea.OutsideArea],
          cardMatcher: new CardMatcher({
            cards: ji,
          }).toSocketPassenger(),
          triggeredBySkills: [this.GeneralName],
        }),
        cardUseEvent.fromId,
      );

      if (response.selectedCards.length === 0) {
        response.selectedCards = [ji[0]];
      }

      if (user.getCardIds(PlayerCardsArea.EquipArea).includes(cardUseEvent.cardId)) {
        await room.moveCards({
          movingCards: [{ card: cardUseEvent.cardId, fromArea: CardMoveArea.EquipArea }],
          fromId: cardUseEvent.fromId,
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: fromId,
          triggeredBySkills: [this.GeneralName],
        });

        await room.moveCards({
          movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.OutsideArea }],
          fromId: cardUseEvent.fromId,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
          proposer: cardUseEvent.fromId,
          triggeredBySkills: [this.GeneralName],
        });

        await room.drawCards(1, fromId, 'top', fromId, this.GeneralName);
      }
    } else {
      const phaseChangeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      if (!phaseChangeEvent.fromPlayer) {
        return false;
      }

      const ji = room
        .getPlayerById(phaseChangeEvent.fromPlayer)
        .getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);

      await room.moveCards({
        movingCards: ji.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
        fromId: phaseChangeEvent.fromPlayer,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}
