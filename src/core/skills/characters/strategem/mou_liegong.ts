import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Functional } from 'core/shares/libs/functional';
import { TransformSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mou_liegong', description: 'mou_liegong_description' })
export class MouLieGong extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      event.fromId === owner.Id &&
      !!owner.getFlag<CardSuit[]>(this.Name) &&
      owner.getFlag<CardSuit[]>(this.Name).length > 0 &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AimEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use {0} to {1}?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const mouLiegongSuits = room.getFlag<CardSuit[]>(event.fromId, this.Name) || [];
    if (mouLiegongSuits.length > 1) {
      const displayCards = room.getCards(mouLiegongSuits.length - 1, 'top');
      const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
        displayCards,
        fromId: event.fromId,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} used skill {1}, display cards: {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId!)),
          this.Name,
          TranslationPack.patchCardInTranslation(...displayCards),
        ).extract(),
      };
      room.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);

      const numberOfSameSuits = displayCards.reduce<number>((sum, cardId) => {
        const suit = Sanguosha.getCardById(cardId).Suit;
        mouLiegongSuits.includes(suit) && sum++;
        return sum;
      }, 0);

      await room.moveCards({
        movingCards: displayCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        moveReason: CardMoveReason.PlaceToDropStack,
        toArea: CardMoveArea.DropStack,
        hideBroadcast: true,
        movedByReason: this.Name,
      });

      aimEvent.additionalDamage = (aimEvent.additionalDamage || 0) + numberOfSameSuits;
    }

    EventPacker.addMiddleware({ tag: this.Name, data: mouLiegongSuits }, aimEvent);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: MouLieGong.Name, description: MouLieGong.Description })
export class MouLieGongShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing || stage === AimStage.AfterAimmed;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent>,
  ): boolean {
    const mouLiegongSuits = owner.getFlag<CardSuit[]>(this.GeneralName) || [];

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardUseEvent.cardId).Suit !== CardSuit.NoSuit &&
        !mouLiegongSuits.includes(Sanguosha.getCardById(cardUseEvent.cardId).Suit)
      );
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.toId === owner.Id &&
        aimEvent.fromId !== owner.Id &&
        Sanguosha.getCardById(aimEvent.byCardId).Suit !== CardSuit.NoSuit &&
        !mouLiegongSuits.includes(Sanguosha.getCardById(aimEvent.byCardId).Suit)
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const mouLiegongSuits = room.getFlag<CardSuit[]>(event.fromId, this.GeneralName) || [];
    mouLiegongSuits.push(
      Sanguosha.getCardById(
        EventPacker.getIdentifier(event.triggeredOnEvent!) === GameEventIdentifiers.CardUseEvent
          ? (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId
          : (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).byCardId,
      ).Suit,
    );

    let text = '{0}[';
    for (const suit of mouLiegongSuits) {
      text += Functional.getCardSuitCharText(suit);
    }
    text += ']';

    room.setFlag<CardSuit[]>(
      event.fromId,
      this.GeneralName,
      mouLiegongSuits,
      TranslationPack.translationJsonPatcher(text, this.GeneralName).toString(),
    );

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: MouLieGongShadow.Name, description: MouLieGongShadow.Description })
export class MouLieGongTransform extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    if (owner.getEquipment(CardType.Weapon)) {
      return;
    }

    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(owner, cardId, PlayerCardsArea.HandArea)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });

    room.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, {
      changedProperties: [
        {
          toId: owner.Id,
          handCards: cards,
        },
      ],
    });
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.GeneralName)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  public canTransform(owner: Player, cardId: CardId, area: PlayerCardsArea.HandArea): boolean {
    if (owner.getEquipment(CardType.Weapon)) {
      return false;
    }

    const card = Sanguosha.getCardById(cardId);
    return card.GeneralName === 'slash' && card.Name !== 'slash';
  }

  public forceToTransformCardTo(cardId: CardId): VirtualCard {
    return VirtualCard.create(
      {
        cardName: 'slash',
        bySkill: this.GeneralName,
      },
      [cardId],
    );
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: MouLieGongTransform.Name, description: MouLieGongTransform.Description })
export class MouLieGongHandler extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.BeforePhaseChange;
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.BeforePhaseChange;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardUseEvent ||
      stage === CardUseStage.CardUseFinishedEffect
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      const askForCardUseEvent = event as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      const cardEffectEvent = askForCardUseEvent.triggeredOnEvent;
      return (
        !!cardEffectEvent &&
        EventPacker.getIdentifier(cardEffectEvent) === GameEventIdentifiers.CardEffectEvent &&
        !!EventPacker.getMiddleware<CardSuit[]>(this.GeneralName, cardEffectEvent)
      );
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        !!EventPacker.getMiddleware<CardSuit[]>(this.GeneralName, cardUseEvent) &&
        !!owner.getFlag<CardSuit[]>(this.GeneralName)
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.CardUseEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AskForCardUseEvent) {
      const askForCardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      const availableSuits = Algorithm.unique(
        [CardSuit.Spade, CardSuit.Club, CardSuit.Diamond, CardSuit.Heart, CardSuit.NoSuit],
        EventPacker.getMiddleware<CardSuit[]>(this.GeneralName, askForCardUseEvent.triggeredOnEvent!)!,
      );
      askForCardUseEvent.cardMatcher.suit = (askForCardUseEvent.cardMatcher.suit || []).concat(...availableSuits);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}
