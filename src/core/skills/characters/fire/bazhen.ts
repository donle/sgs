import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { BaGuaZhenSkill } from 'core/skills/cards/standard/baguazhen';
import { CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'bazhen', description: 'bazhen_description' })
export class BaZhen extends BaGuaZhenSkill {
  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    if (!content) {
      return true;
    }

    const { cardMatcher } = content;
    return (
      owner.Id === content.toId &&
      CardMatcher.match(
        cardMatcher,
        new CardMatcher({
          name: ['jink'],
        }),
      ) &&
      owner.getEquipment(CardType.Armor) === undefined
    );
  }

}
