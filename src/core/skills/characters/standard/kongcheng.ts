import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, FilterSkill } from 'core/skills/skill';

@CompulsorySkill
export class KongCheng extends FilterSkill {
  constructor() {
    super('kongcheng', 'kongcheng_description');
  }
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    const player = room.getPlayerById(owner);

    if (player.getCardIds(PlayerCardsArea.HandArea).length !== 0) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      return !new CardMatcher({ name: ['slash', 'duel'] }).match(cardId);
    } else {
      const cardName = Sanguosha.getCardById(cardId).GeneralName;
      return cardName !== 'slash' && cardName !== 'duel';
    }
  }
}
