import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, CompulsorySkill, RulesBreakerSkill, ShadowSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'wusheng', description: 'wusheng_description' })
export class WuSheng extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['slash'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.canUseCard(room, new CardMatcher({ name: ['slash'], suit: [CardSuit.Heart, CardSuit.Diamond] }));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean {
    if (cardMatcher) {
      return cardMatcher.match(new CardMatcher({ name: ['slash'] }));
    } else {
      return Sanguosha.getCardById(pendingCardId).isRed();
    }
  }
  public viewAs(selectedCards: CardId[]): VirtualCard {
    return VirtualCard.create<Slash>(
      {
        cardName: 'slash',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill({ remainStatus: true })
@CompulsorySkill({ name: WuSheng.GeneralName, description: WuSheng.Description })
export class WuShengShadow extends RulesBreakerSkill {
  breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player) {
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ name: ['slash'], suit: [CardSuit.Diamond] })) ? INFINITE_DISTANCE : 0;
    } else {
      const card = Sanguosha.getCardById(cardId);
      return card.GeneralName === 'slash' && card.Suit === CardSuit.Diamond ? INFINITE_DISTANCE : 0;
    }
  }
}
