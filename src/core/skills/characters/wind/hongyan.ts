import { VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { CompulsorySkill, TransformSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'hongyan', description: 'hongyan_description' })
export class HongYan extends TransformSkill {
  public get Place(): (PlayerCardsArea.HandArea | PlayerCardsArea.EquipArea)[] {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  public includesJudgeCard() {
    return true;
  }

  public forceToTransformCardTo(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    if (card.Suit === CardSuit.Spade) {
      return VirtualCard.create(
        {
          cardName: card.Name,
          cardNumber: card.CardNumber,
          cardSuit: CardSuit.Heart,
          bySkill: this.Name,
        },
        [cardId],
      );
    }
    return card;
  }
}
