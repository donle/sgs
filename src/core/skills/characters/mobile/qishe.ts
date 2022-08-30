import { CardType, VirtualCard } from 'core/cards/card';
import { Alcohol } from 'core/cards/legion_fight/alcohol';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, ViewAsSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'qishe', description: 'qishe_description' })
export class QiShe extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['alcohol'];
  }

  public canUse(room: Room, owner: Player) {
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['alcohol'] })) &&
      owner.getPlayerCards().length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).is(CardType.Equip);
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<Alcohol>(
      {
        cardName: 'alcohol',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: QiShe.Name, description: QiShe.Description })
export class QiSheShadow extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    return owner.getCardIds(PlayerCardsArea.EquipArea).length;
  }
}
