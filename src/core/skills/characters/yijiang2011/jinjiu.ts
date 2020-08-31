import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { AlcoholSkill } from 'core/skills/cards/legion_fight/alcohol';
import { TransformSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'jinjiu', description: 'jinjiu_description' })
export class JinJiu extends TransformSkill {
  public canTransform(cardId: CardId) {
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
