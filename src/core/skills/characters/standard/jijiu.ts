import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Peach } from 'core/cards/standard/peach';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jijiu', description: 'jijiu_description' })
export class JiJiu extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['peach'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return room.CurrentPlayer !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).isRed();
  }

  public viewAs(selectedCards: CardId[]): VirtualCard {
    return VirtualCard.create<Peach>(
      {
        cardName: 'peach',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}
