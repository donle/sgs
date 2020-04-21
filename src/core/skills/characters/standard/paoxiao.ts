import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill
export class PaoXiao extends RulesBreakerSkill {
  constructor() {
    super('paoxiao', 'paoxiao_description');
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player) {
    if (!owner.hasUsed('slash')) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ name: ['slash'] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.GeneralName === 'slash';
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher) {
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ name: ['slash'] })) ? INFINITE_TRIGGERING_TIMES : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? INFINITE_TRIGGERING_TIMES : 0;
    }
  }
}
