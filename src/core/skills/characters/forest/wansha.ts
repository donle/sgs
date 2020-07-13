import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { GlobalFilterSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'wansha', description: 'wansha_description' })
export class WanSha extends GlobalFilterSkill {
  canUseCardTo(cardId: CardId | CardMatcher, room: Room, owner: Player, from: Player, to: Player) {
    const inOwnersRound = room.CurrentPlayer.Id === owner.Id && to.Dying && from.Id !== to.Id;

    if (cardId instanceof CardMatcher) {
      if (inOwnersRound && cardId.match(new CardMatcher({ name: ['peach'] }))) {
        return false;
      }
    } else {
      if (inOwnersRound && Sanguosha.getCardById(cardId).GeneralName === 'peach') {
        return false;
      }
    }

    return true;
  }
}
