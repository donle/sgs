import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';

export namespace System {
  export const enum AskForChoosingCardEventFilter {
    SheLie,
    PoXi,
  }

  const differentCardSuitFilterFunction = (allCards: CardId[], selected: CardId[], currentCard: CardId) => {
    const card = Sanguosha.getCardById(currentCard);
    return (
      selected.includes(currentCard) ||
      selected.find(cardId => Sanguosha.getCardById(cardId).Suit === card.Suit) === undefined
    );
  };

  export type AskForChoosingCardEventFilterFunc = (
    allCards: CardId[],
    selected: CardId[],
    currentCard: CardId,
  ) => boolean;

  export const AskForChoosingCardEventFilters: {
    [K in AskForChoosingCardEventFilter]: AskForChoosingCardEventFilterFunc;
  } = {
    [AskForChoosingCardEventFilter.PoXi]: differentCardSuitFilterFunction,
    [AskForChoosingCardEventFilter.SheLie]: differentCardSuitFilterFunction,
  };
}
