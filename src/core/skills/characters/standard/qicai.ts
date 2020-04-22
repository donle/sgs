import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'qicai', description: 'qicai_description' })
export class QiCai extends RulesBreakerSkill {
  public breakCardUsableDistance(cardId: CardId | CardMatcher) {
    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ type: [CardType.Trick] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.is(CardType.Trick);
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }
}
