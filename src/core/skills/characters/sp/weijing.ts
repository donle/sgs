import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ViewAsSkill } from 'core/skills/skill';
import { CircleSkill, CommonSkill } from 'core/skills/skill_wrappers';

@CircleSkill
@CommonSkill({ name: 'weijing', description: 'weijing_description' })
export class WeiJing extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['jink', 'slash'];
  }

  public canUse(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>) {
    if (owner.hasUsedSkill(this.Name)) {
      return false;
    }

    const identifier = event && EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      return (
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ generalName: ['slash'] })) ||
        CardMatcher.match(event!.cardMatcher, new CardMatcher({ name: ['jink'] }))
      );
    }

    return (
      owner.canUseCard(room, new CardMatcher({ name: ['slash'] })) &&
      identifier !== GameEventIdentifiers.AskForCardResponseEvent
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public viewAs(selectedCards: CardId[], owner: Player, viewAs: string): VirtualCard {
    return VirtualCard.create({
      cardName: viewAs,
      bySkill: this.Name,
    });
  }
}
