import { Card } from 'core/cards/card';
import { Player, PlayerCardsArea } from 'core/player/player';

export class ServerPlayer extends Player {
  drawCards(...cards: Card[]) {
    const handCards = this.getCards(PlayerCardsArea.HandArea);
    for (const card of cards) {
      handCards.push(card);
    }
  }

  dropCards(...cards: Card[]) {
    const playerCardsAreas = [
      PlayerCardsArea.EquipArea,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HoldingArea,
      PlayerCardsArea.JudgeArea,
    ];
    for (const playerCardsArea of playerCardsAreas) {
      const areaCards = this.getCards(playerCardsArea);
      for (const card of cards) {
        const index = areaCards.findIndex(areaCard => areaCard.Id === card.Id);
        if (index >= 0) {
          areaCards.splice(index, 1);
        }
      }
    }
  }
}
