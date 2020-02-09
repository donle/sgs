import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { Player } from 'core/player/player';
import { CommonSkill, RulesBreakerSkill } from 'core/skills/skill';

@CommonSkill
export class ZhuGeLianNuSlashSkill extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId) {
    if (Sanguosha.getCardById(cardId) instanceof Slash) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }

  public onLoseSkill(owner: Player) {
    GameCommonRules.addCardUsableTimes(
      new CardMatcher({ name: ['slash'] }),
      -INFINITE_TRIGGERING_TIMES,
      owner,
    );
  }
}
