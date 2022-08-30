import { CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'taoluan', description: 'taoluan_description' })
export class TaoLuan extends ViewAsSkill implements OnDefineReleaseTiming {
  public static readonly Used = 'taoluan_used';

  public async whenObtainingSkill(room: Room, player: Player) {
    const records = room.Analytics.getCardUseRecord(player.Id);

    for (const event of records) {
      const usedCards = player.getFlag<string[]>(this.Name) || [];
      const card = Sanguosha.getCardById(event.cardId);
      if (
        card.isVirtualCard() &&
        (card as VirtualCard).findByGeneratedSkill(this.Name) &&
        !usedCards.includes(card.GeneralName)
      ) {
        usedCards.push(card.GeneralName);
        room.setFlag<string[]>(player.Id, this.Name, usedCards);
      }
    }
  }

  public canViewAs(room: Room, owner: Player): string[] {
    const usedCards = owner.getFlag<string[]>(this.Name) || [];
    return Sanguosha.getCardNameByType(
      types =>
        (types.includes(CardType.Trick) || types.includes(CardType.Basic)) && !types.includes(CardType.DelayedTrick),
    ).filter(name => !usedCards.includes(Sanguosha.getCardByName(name).GeneralName));
  }

  public canUse(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
  ): boolean {
    if (owner.getFlag<boolean>(TaoLuan.Used)) {
      return false;
    }

    const identifier = event && EventPacker.getIdentifier(event);
    const usedCards = owner.getFlag<string[]>(this.Name) || [];
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      return (
        Sanguosha.getCardNameByType(
          types =>
            (types.includes(CardType.Trick) || types.includes(CardType.Basic)) &&
            !types.includes(CardType.DelayedTrick),
        ).find(name => {
          return (
            !usedCards.includes(Sanguosha.getCardByName(name).GeneralName) &&
            owner.canUseCard(room, new CardMatcher({ name: [name] }), new CardMatcher(event!.cardMatcher))
          );
        }) !== undefined
      );
    }

    return (
      identifier !== GameEventIdentifiers.AskForCardResponseEvent &&
      Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).find(name => {
        return (
          !usedCards.includes(Sanguosha.getCardByName(name).GeneralName) &&
          owner.canUseCard(room, new CardMatcher({ name: [name] }))
        );
      }) !== undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return true;
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown taoluan card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TaoLuan.Name, description: TaoLuan.Description })
export class TaoLuanShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.BeforePhaseChange;
  }

  public getPriority(): StagePriority {
    return StagePriority.Low;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      (stage === CardUseStage.BeforeCardUseEffect &&
        content.fromId === owner.Id &&
        Sanguosha.getCardById(content.cardId).isVirtualCard() &&
        Sanguosha.getCardById<VirtualCard>(content.cardId).findByGeneratedSkill(this.GeneralName)) ||
      EventPacker.getMiddleware<PlayerId>(this.GeneralName, content) === owner.Id
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (
      EventPacker.getMiddleware<PlayerId>(
        this.GeneralName,
        event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>,
      ) === event.fromId
    ) {
      const others = room.getOtherPlayers(event.fromId).map(player => player.Id);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: others,
          toId: event.fromId,
          requiredAmount: 1,
          conversation: 'taoluan: please choose another player to ask for a card',
          triggeredBySkills: [this.GeneralName],
        },
        event.fromId,
        true,
      );

      response.selectedPlayers = response.selectedPlayers || [others[Math.floor(Math.random() * others.length)]];

      const card = Sanguosha.getCardById(
        (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
      );
      const typeExcept = [CardType.Basic, CardType.Trick, CardType.Equip].filter(type => type !== card.BaseType);
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: response.selectedPlayers[0],
          reason: this.GeneralName,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please give a card to {1}, or he/she will lose 1 hp',
            this.GeneralName,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
          ).extract(),
          cardMatcher: new CardMatcher({ type: typeExcept }).toSocketPassenger(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.GeneralName],
        },
        response.selectedPlayers[0],
      );

      if (resp.selectedCards && resp.selectedCards.length > 0) {
        await room.moveCards({
          movingCards: [
            {
              card: resp.selectedCards[0],
              fromArea: room.getPlayerById(response.selectedPlayers[0]).cardFrom(resp.selectedCards[0]),
            },
          ],
          fromId: response.selectedPlayers[0],
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: response.selectedPlayers[0],
          triggeredBySkills: [this.GeneralName],
        });
      } else {
        await room.loseHp(event.fromId, 1);
        room.setFlag<boolean>(event.fromId, TaoLuan.Used, true);
      }
    } else {
      const card = Sanguosha.getCardById(
        (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
      );
      const usedCards = room.getFlag<string[]>(event.fromId, this.GeneralName) || [];
      usedCards.includes(card.GeneralName) || usedCards.push(card.GeneralName);
      room.setFlag<string[]>(event.fromId, this.GeneralName, usedCards);

      EventPacker.addMiddleware(
        { tag: this.GeneralName, data: event.fromId },
        event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>,
      );
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TaoLuanShadow.Name, description: TaoLuanShadow.Description })
export class TaoLuanClear extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(TaoLuan.Used) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, TaoLuan.Used);

    return true;
  }
}
