import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, RulesBreakerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'fangtianhuaji', description: 'fangtianhuaji_description' })
export class FangTianHuaJiSkill extends RulesBreakerSkill {
  breakCardUsableTargets(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (cardId instanceof CardMatcher) {
      return 0;
    }

    const handCards = owner.getCardIds(PlayerCardsArea.HandArea);
    if (handCards.length !== 1) {
      return 0;
    }

    const realCards = Card.getActualCards([cardId]);
    const isSlash = realCards.length === 1 ? realCards[0] === handCards[0] : false;
    if (isSlash && Sanguosha.getCardById(cardId).GeneralName === 'slash') {
      return 2;
    }

    return 0;
  }
}
