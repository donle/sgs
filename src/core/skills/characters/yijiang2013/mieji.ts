import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'mieji', description: 'mieji_description' })
export class MieJi extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    const card = Sanguosha.getCardById(cardId);
    return card.isBlack() && card.is(CardType.Trick);
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (skillUseEvent.cardIds! !== undefined) {
      await room.moveCards({
        movingCards: skillUseEvent.cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: skillUseEvent.fromId,
        moveReason: CardMoveReason.PassiveMove,
        toArea: CardMoveArea.DrawStack,
        proposer: skillUseEvent.fromId,
        movedByReason: this.Name,
      });
    }
    const { toIds, fromId } = skillUseEvent;
    const to = room.getPlayerById(toIds![0]);
    const toId = toIds![0];
    const response = await room.askForCardDrop(
      toId,
      Math.min(1, room.getPlayerById(toId).getPlayerCards().length),
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      true,
      undefined,
      this.Name,
    );
    await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId);
    const card = Sanguosha.getCardById(response.droppedCards[0]);
    if (card.is(CardType.Trick)) {
      return true;
    }
      const response2 = await room.askForCardDrop(
        toId,
        Math.min(1, room.getPlayerById(toId).getPlayerCards().length),
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        to
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(cardId => Sanguosha.getCardById(cardId).BaseType === CardType.Trick),
        this.Name,
      );
      if (response2.droppedCards.length <= 0) {
        return true;
      } else {
        await room.dropCards(CardMoveReason.SelfDrop, response2.droppedCards, toId);
      }
    
    return true;
  }
}
