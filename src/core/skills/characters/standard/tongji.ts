import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { GlobalFilterSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'tongji', description: 'tongji_description' })
export class TongJi extends GlobalFilterSkill {
  canUseCardTo(cardId: CardId | CardMatcher, room: Room, owner: Player, attacker: Player, target: Player) {
    if (cardId instanceof CardMatcher) {
      if (!cardId.match(new CardMatcher({ generalName: ['slash'] }))) {
        return true;
      }
    } else {
      if (Sanguosha.getCardById(cardId).GeneralName !== 'slash') {
        return true;
      }
    }

    if (attacker === owner || owner.getCardIds(PlayerCardsArea.HandArea).length <= owner.Hp) {
      return true;
    }

    if (attacker.getAttackDistance(room) >= room.distanceBetween(attacker, owner)) {
      return target === owner;
    }

    return true;
  }
}
