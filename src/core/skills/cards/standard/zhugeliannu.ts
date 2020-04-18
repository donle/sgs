import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { CommonSkill, RulesBreakerSkill } from 'core/skills/skill';

@CommonSkill
export class ZhuGeLianNuSlashSkill extends RulesBreakerSkill {
  constructor() {
    super('zhugeliannu', 'zhugeliannu_description');
  }
  public breakCardUsableTimes(cardId: CardId | CardMatcher) {
    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ name: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}
