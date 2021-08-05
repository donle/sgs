import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  CompulsorySkill,
  GlobalRulesBreakerSkill,
  OnDefineReleaseTiming,
  ShadowSkill,
  TransformSkill,
} from 'core/skills/skill';

@CompulsorySkill({ name: 'xianghai', description: 'xianghai_description' })
export class XiangHai extends TransformSkill implements OnDefineReleaseTiming {
  async whenObtainingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (this.canTransform(cardId, PlayerCardsArea.HandArea)) {
        return this.forceToTransformCardTo(cardId).Id;
      }

      return cardId;
    });

    room.broadcast(GameEventIdentifiers.PlayerPropertiesChangeEvent, {
      changedProperties: [
        {
          toId: owner.Id,
          handCards: cards,
        },
      ],
    });
  }

  async whenLosingSkill(room: Room, owner: Player) {
    const cards = owner.getCardIds(PlayerCardsArea.HandArea).map(cardId => {
      if (!Card.isVirtualCardId(cardId)) {
        return cardId;
      }

      const card = Sanguosha.getCardById<VirtualCard>(cardId);
      if (!card.findByGeneratedSkill(this.Name)) {
        return cardId;
      }

      return card.ActualCardIds[0];
    });

    owner.setupCards(PlayerCardsArea.HandArea, cards);
  }

  public canTransform(cardId: CardId, area: PlayerCardsArea.HandArea): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.is(CardType.Equip) && area === PlayerCardsArea.HandArea;
  }

  public forceToTransformCardTo(cardId: CardId): VirtualCard {
    return VirtualCard.create(
      {
        cardName: 'alcohol',
        bySkill: this.Name,
      },
      [cardId],
    );
  }
}

@ShadowSkill
@CompulsorySkill({ name: XiangHai.Name, description: XiangHai.Description })
export class XiangHaiShadow extends GlobalRulesBreakerSkill {
  public breakAdditionalCardHold(room: Room, owner: Player, target: Player): number {
    return target !== owner ? -1 : 0;
  }
}
