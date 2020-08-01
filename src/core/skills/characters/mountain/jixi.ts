import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ShunshouQianYang } from 'core/cards/standard/shunshouqianyang';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';
import { TunTian } from './tuntian';

@CommonSkill({ name: 'jixi', description: 'jixi_description' })
export class JiXi extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['shunshouqianyang'];
  }
  public canUse(room: Room, owner: Player) {
    return (
      owner.canUseCard(room, new CardMatcher({ name: this.canViewAs() })) &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, TunTian.Name).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return owner.getCardIds(PlayerCardsArea.OutsideArea, TunTian.Name).includes(pendingCardId);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.OutsideArea];
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<ShunshouQianYang>(
      {
        cardName: 'shunshouqianyang',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}
