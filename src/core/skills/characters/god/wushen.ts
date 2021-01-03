import { Card, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  CompulsorySkill,
  OnDefineReleaseTiming,
  RulesBreakerSkill,
  ShadowSkill,
  TransformSkill,
  TriggerSkill,
} from 'core/skills/skill';

@CompulsorySkill({ name: 'wushen', description: 'wushen_description' })
export class WuShen extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(cardId, PlayerCardsArea.HandArea)) {
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
    const cards = [owner.getCardIds(PlayerCardsArea.HandArea), owner.getCardIds(PlayerCardsArea.EquipArea)].map(cards =>
      cards.map(cardId => {
        if (!Card.isVirtualCardId(cardId)) {
          return cardId;
        }

        const card = Sanguosha.getCardById<VirtualCard>(cardId);
        if (!card.findByGeneratedSkill(this.Name)) {
          return cardId;
        }

        return card.ActualCardIds[0];
      }),
    );

    room.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, {
      changedProperties: [
        {
          toId: owner.Id,
          handCards: cards[0],
          equips: cards[1],
        },
      ],
    });
  }

  public canTransform(cardId: CardId, area: PlayerCardsArea.HandArea): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.Suit === CardSuit.Heart && area === PlayerCardsArea.HandArea;
  }

  public forceToTransformCardTo(cardId: CardId): VirtualCard {
    const card = Sanguosha.getCardById(cardId);
    return VirtualCard.create(
      {
        cardName: 'slash',
        cardNumber: card.CardNumber,
        cardSuit: CardSuit.Heart,
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}

@ShadowSkill
@CompulsorySkill({ name: WuShen.Name, description: WuShen.Description })
export class WuShenShadow extends RulesBreakerSkill {
  private breakCardUsableMethod(cardId: CardId | CardMatcher): number {
    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ suit: [CardSuit.Heart], generalName: ['slash'] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.GeneralName === 'slash' && card.Suit === CardSuit.Heart;
    }

    return match ? INFINITE_TRIGGERING_TIMES : 0;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher): number {
    return this.breakCardUsableMethod(cardId);
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher): number {
    return this.breakCardUsableMethod(cardId);
  }
}

@ShadowSkill
@CompulsorySkill({ name: WuShenShadow.Name, description: WuShenShadow.Description })
export class WuShenDisresponse extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage): boolean {
    return stage === AimStage.AfterAim;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const card = event.byCardId && Sanguosha.getCardById(event.byCardId);
    return event.fromId === owner.Id && !!card && card.GeneralName === 'slash' && card.Suit === CardSuit.Heart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const aimEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    EventPacker.setDisresponsiveEvent(aimEvent);

    return true;
  }
}
