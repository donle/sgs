import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Jink } from 'core/cards/standard/jink';
import { Slash } from 'core/cards/standard/slash';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'std_longdan', description: 'std_longdan_description' })
export class StdLongDan extends ViewAsSkill {
  public canViewAs(room: Room, owner: Player, selectedCards?: CardId[]): string[] {
    if (!selectedCards) {
      return ['jink', 'slash'];
    } else {
      const card = Sanguosha.getCardById(selectedCards[0]);
      if (card.GeneralName === 'slash') {
        return ['jink'];
      }
      if (card.GeneralName === 'jink') {
        return ['slash'];
      }

      return [];
    }
  }

  public canUse(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent>,
  ) {
    const identifier = event && EventPacker.getIdentifier(event);
    if (
      identifier === GameEventIdentifiers.AskForCardUseEvent ||
      identifier === GameEventIdentifiers.AskForCardResponseEvent
    ) {
      return (
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ generalName: ['slash'] })) ||
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ name: ['jink'] }))
      );
    }

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
      } else if (cardMatcher.Matcher.name?.includes('slash') || cardMatcher.Matcher.generalName?.includes('slash')) {
        canUse = Sanguosha.getCardById(pendingCardId).GeneralName === 'jink';
      }

      return canUse;
    } else {
      const card = Sanguosha.getCardById(pendingCardId);
      return card.GeneralName === 'jink' && owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] }));
    }
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
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
