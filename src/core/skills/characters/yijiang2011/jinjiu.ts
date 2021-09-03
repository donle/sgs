import { Card, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AlcoholSkill } from 'core/skills/cards/legion_fight/alcohol';
import { OnDefineReleaseTiming, TransformSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'jinjiu', description: 'jinjiu_description' })
export class JinJiu extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(owner, cardId)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.Name)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  public canTransform(owner: Player, cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return card.GeneralName === AlcoholSkill.GeneralName;
  }

  public includesJudgeCard() {
    return true;
  }

  public forceToTransformCardTo(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return VirtualCard.create(
      {
        cardName: 'slash',
        cardNumber: card.CardNumber,
        cardSuit: card.Suit,
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}
