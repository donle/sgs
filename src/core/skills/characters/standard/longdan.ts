import { VirtualCard } from 'core/cards/card';
import { Alcohol } from 'core/cards/legion_fight/alcohol';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Jink } from 'core/cards/standard/jink';
import { Peach } from 'core/cards/standard/peach';
import { Slash } from 'core/cards/standard/slash';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'longdan', description: 'longdan_description' })
export class LongDan extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[]): string[] {
    if (!selectedCards) {
      return ['jink', 'slash', 'alcohol', 'peach'];
    } else {
      const card = Sanguosha.getCardById(selectedCards[0]);
      if (card.GeneralName === 'slash') {
        return ['jink'];
      }
      if (card.GeneralName === 'jink') {
        return ['slash'];
      }
      if (card.GeneralName === 'alcohol') {
        return ['peach'];
      }
      if (card.GeneralName === 'peach') {
        return ['alcohol'];
      }

      return [];
    }
  }

  public canUse(room: Room, owner: Player) {
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['slash'] })) ||
      owner.canUseCard(room, new CardMatcher({ name: ['peach'] })) ||
      owner.canUseCard(room, new CardMatcher({ name: ['alcohol'] }))
    );
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
      } else if (cardMatcher.Matcher.name?.includes('peach')) {
        canUse = Sanguosha.getCardById(pendingCardId).GeneralName === 'alcohol';
      } else if (cardMatcher.Matcher.name?.includes('alcohol')) {
        canUse = Sanguosha.getCardById(pendingCardId).GeneralName === 'peach';
      }

      return canUse && owner.cardFrom(pendingCardId) === PlayerCardsArea.HandArea;
    } else {
      const fromHandArea = owner.cardFrom(pendingCardId) === PlayerCardsArea.HandArea;
      const card = Sanguosha.getCardById(pendingCardId);
      if (card.GeneralName === 'jink') {
        return fromHandArea && owner.canUseCard(room, new CardMatcher({ name: ['slash'] }));
      } else if (card.GeneralName === 'alcohol') {
        return fromHandArea && owner.canUseCard(room, new CardMatcher({ name: ['peach'] }));
      } else if (card.GeneralName === 'peach') {
        return fromHandArea && owner.canUseCard(room, new CardMatcher({ name: ['alcohol'] }));
      }

      return false;
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
    } else if (card.GeneralName === 'jink') {
      return VirtualCard.create<Slash>(
        {
          cardName: 'slash',
          bySkill: this.Name,
        },
        selectedCards,
      );
    } else if (card.GeneralName === 'peach') {
      return VirtualCard.create<Alcohol>(
        {
          cardName: 'alcohol',
          bySkill: this.Name,
        },
        selectedCards,
      );
    } else {
      return VirtualCard.create<Peach>(
        {
          cardName: 'peach',
          bySkill: this.Name,
        },
        selectedCards,
      );
    }
  }
}
