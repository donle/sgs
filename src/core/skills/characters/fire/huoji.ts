import { VirtualCard } from 'core/cards/card';
import { FireAttack } from 'core/cards/legion_fight/fire_attack';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'huoji', description: 'huoji_description' })
export class HuoJi extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['fire_attack'];
  }

  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ name: ['fire_attack'] })) && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).isRed();
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<FireAttack>(
      {
        cardName: 'fire_attack',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}
