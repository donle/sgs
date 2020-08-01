import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, FilterSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'weimu', description: 'weimu_description' })
export class WeiMu extends FilterSkill {
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    if (cardId instanceof CardMatcher) {
      return !new CardMatcher({ suit: [CardSuit.Spade, CardSuit.Club], type: [CardType.Trick] }).match(cardId);
    } else {
      const card = Sanguosha.getCardById(cardId);
      return !(card.is(CardType.Trick) && card.isBlack());
    }
  }
}
