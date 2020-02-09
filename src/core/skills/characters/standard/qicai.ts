import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill
export class QiCaiSkill extends RulesBreakerSkill {
  constructor() {
    super('qicai', 'qicai_description');
  }
  public breakCardUsableDistance(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    if (card.is(CardType.Trick)) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }
}
