import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { WuXieKeJi } from 'core/cards/standard/wuxiekeji';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, ViewAsSkill } from 'core/skills/skill';

@CommonSkill({ name: 'kanpo', description: 'kanpo_description' })
export class KanPo extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['wuxiekeji'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.canUseCard(room, new CardMatcher({ name: ['wuxiekeji'] })) && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).isBlack();
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<WuXieKeJi>(
      {
        cardName: 'wuxiekeji',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}
