import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Jink } from 'core/cards/standard/jink';
import { Slash } from 'core/cards/standard/slash';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'longdan', description: 'longdan_description' })
export class LongDan extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['jink', 'slash'];
  }
  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ name: ['slash'] }));
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
      let canUse = false;
      if (cardMatcher.Matcher.name?.includes('jink')) {
        canUse = Sanguosha.getCardById(pendingCardId).GeneralName === 'slash';
      } else if (cardMatcher.Matcher.name?.includes('slash')) {
        canUse = Sanguosha.getCardById(pendingCardId).GeneralName === 'jink';
      }

      return canUse && owner.cardFrom(pendingCardId) === PlayerCardsArea.HandArea;
    } else {
      return (
        Sanguosha.getCardById(pendingCardId).GeneralName === 'jink' &&
        owner.cardFrom(pendingCardId) === PlayerCardsArea.HandArea
      );
    }
  }

  public viewAs(selectedCards: CardId[]) {
    const card = Sanguosha.getCardById(selectedCards[0]);
    if (card.GeneralName === 'slash') {
      return VirtualCard.create<Jink>(
        {
          cardName: 'jink',
          bySkill: this.Name,
        },
        selectedCards,
      );
    } else {
      return VirtualCard.create<Slash>(
        {
          cardName: 'slash',
          bySkill: this.Name,
        },
        selectedCards,
      );
    }
  }
}
