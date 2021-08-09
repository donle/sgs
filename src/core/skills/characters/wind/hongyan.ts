import { Card, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill, ShadowSkill, TransformSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';

@CompulsorySkill({ name: 'hongyan', description: 'hongyan_description' })
export class HongYan extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const handcards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(cardId)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });

    owner.setupCards(PlayerCardsArea.HandArea, handcards);
    
    const equips = owner.getCardIds(PlayerCardsArea.EquipArea).map(cardId => {
      if (this.canTransform(cardId)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });
    owner.setupCards(PlayerCardsArea.EquipArea, equips);
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const handcards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.Name)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });

    owner.setupCards(PlayerCardsArea.HandArea, handcards);

    const equipCards = owner.getCardIds(PlayerCardsArea.EquipArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.Name)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });
    owner.setupCards(PlayerCardsArea.EquipArea, equipCards);
  }

  canTransform(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return card.Suit === CardSuit.Spade;
  }

  public includesJudgeCard() {
    return true;
  }

  public forceToTransformCardTo(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
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
}

@ShadowSkill
@CompulsorySkill({ name: HongYan.Name, description: HongYan.Description })
export class HongYanShadow extends RulesBreakerSkill {
  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    if (
      owner
        .getCardIds(PlayerCardsArea.EquipArea)
        .find(cardId => Sanguosha.getCardById(cardId).Suit === CardSuit.Heart) !== undefined
    ) {
      return owner.MaxHp;
    }

    return -1;
  }
}
