import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill
export class WuSheng extends ViewAsSkill {
  constructor() {
    super('wusheng', 'wusheng_description');
  }

  public canViewAs(): string[] {
    return ['slash'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.canUseCard(room, new CardMatcher({ name: ['slash'], suit: [CardSuit.Heart, CardSuit.Diamond] }));
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length == 1;
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
        bySkill: this.name,
      },
      selectedCards,
      this,
    );
  }
}

//! Shadow skill will be created as long as distance skill are perfectly supported.
