import { CardId } from 'core/cards/libs/card_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';

export interface ExtralCardSkillProperty {
  isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean;
}
