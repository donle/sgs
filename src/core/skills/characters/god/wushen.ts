import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { PlayerCardsArea } from 'core/player/player_props';
import { CompulsorySkill, RulesBreakerSkill, ShadowSkill, TransformSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'wushen', description: 'wushen_description' })
export class WuShen extends TransformSkill {
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
  public breakCardUsableDistance(cardId: CardId | CardMatcher): number {
    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ suit: [CardSuit.Heart], name: ['slash'] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.GeneralName === 'slash' && card.Suit === CardSuit.Heart;
    }

    return match ? INFINITE_DISTANCE : 0;
  }
}
