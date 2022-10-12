import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'huomo', description: 'huomo_description' })
export class HuoMo extends ViewAsSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    const records = room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent &&
        event.fromId === player.Id &&
        Sanguosha.getCardById(event.cardId).is(CardType.Basic),
      undefined,
      'round',
    );

    for (const event of records) {
      const cardId = event.cardId;
      const usedCards = room.getFlag<string[]>(player.Id, this.GeneralName) || [];
      if (!usedCards.includes(Sanguosha.getCardById(cardId).GeneralName)) {
        const slashName = Sanguosha.getCardById(cardId).GeneralName;
        if (slashName === 'slash') {
          usedCards.push('slash', 'thunder_slash', 'fire_slash');
        } else {
          usedCards.push(Sanguosha.getCardById(cardId).GeneralName);
        }
        room.setFlag(player.Id, this.GeneralName, usedCards);
      }
    }
  }

  public canViewAs(room: Room, owner: Player): string[] {
    const usedCards = owner.getFlag<string[]>(this.Name) || [];
    return Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).filter(
      name => !usedCards.includes(name),
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
  ): boolean {
    const identifier = event && EventPacker.getIdentifier(event);
    const usedCards = owner.getFlag<string[]>(this.Name) || [];
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      return (
        Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).find(
          name =>
            !usedCards.includes(name) &&
            owner.canUseCard(room, new CardMatcher({ name: [name] }), new CardMatcher(event!.cardMatcher)),
        ) !== undefined
      );
    }

    return (
      identifier !== GameEventIdentifiers.AskForCardResponseEvent &&
      Sanguosha.getCardNameByType(types => types.includes(CardType.Basic)).find(
        name => !usedCards.includes(name) && owner.canUseCard(room, new CardMatcher({ name: [name] })),
      ) !== undefined
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return !Sanguosha.getCardById(pendingCardId).is(CardType.Basic) && Sanguosha.getCardById(pendingCardId).isBlack();
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    Precondition.assert(!!viewAs, 'Unknown huomo card');
    return VirtualCard.create(
      {
        cardName: viewAs,
        bySkill: this.Name,
        cardNumber: 0,
        cardSuit: CardSuit.NoSuit,
        hideActualCard: true,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: HuoMo.Name, description: HuoMo.Description })
export class HuoMoShadow extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  get Muted() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.PreCardUse && Card.isVirtualCardId(event.cardId);
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      Sanguosha.getCardById<VirtualCard>(content.cardId).findByGeneratedSkill(this.GeneralName)
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const preuseCard = Sanguosha.getCardById<VirtualCard>(cardEvent.cardId);
    const realCard = preuseCard.ActualCardIds[0];
    const from = room.getPlayerById(cardEvent.fromId);

    await room.moveCards({
      fromId: event.fromId,
      movingCards: [
        {
          card: realCard,
          fromArea: from.cardFrom(realCard),
        },
      ],
      moveReason: CardMoveReason.ActiveMove,
      toArea: CardMoveArea.DrawStack,
      movedByReason: this.GeneralName,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} placed card {1} on the top of draw stack',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(realCard),
      ).extract(),
    });

    cardEvent.cardId = VirtualCard.create({
      bySkill: this.GeneralName,
      cardName: preuseCard.Name,
    }).Id;

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: HuoMoShadow.Name, description: HuoMoShadow.Description })
export class HuoMoRecord extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  get Muted() {
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
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return cardUseEvent.fromId === owner.Id && Sanguosha.getCardById(cardUseEvent.cardId).is(CardType.Basic);
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.from === PlayerPhase.PhaseFinish && owner.getFlag<string[]>(this.GeneralName) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent, fromId } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId;
      const usedCards = room.getFlag<string[]>(fromId, this.GeneralName) || [];
      if (!usedCards.includes(Sanguosha.getCardById(cardId).GeneralName)) {
        const slashName = Sanguosha.getCardById(cardId).GeneralName;
        if (slashName === 'slash') {
          usedCards.push('slash', 'thunder_slash', 'fire_slash');
        } else {
          usedCards.push(Sanguosha.getCardById(cardId).GeneralName);
        }
        room.setFlag(fromId, this.GeneralName, usedCards);
      }
    } else {
      room.removeFlag(fromId, this.GeneralName);
    }

    return true;
  }
}
