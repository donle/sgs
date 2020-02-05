import { Card } from 'core/cards/card';
import { PlayerCardsArea } from 'core/player/player_props';
import { CardSuit } from './card_props';

export type CardMatcherProps = {
  suit?: CardSuit[];
  cardNumber?: number[];
  name?: string[];
  from?: PlayerCardsArea[];
};

export type CardMatcherSocketPassenger = {
  tag: 'card-matcher';
} & CardMatcherProps;

export class CardMatcher {
  constructor(private matcher?: CardMatcherProps) {}

  public static match(
    matcher: CardMatcherSocketPassenger | undefined,
    card: Card | CardMatcherProps,
  ) {
    if (matcher === undefined) {
      return false;
    }

    if (matcher.tag && matcher.tag !== 'card-matcher') {
      throw new Error('Invalid card matcher props');
    }

    const { suit, cardNumber, name } = matcher;
    let matched = true;

    if (card instanceof Card) {
      if (suit) {
        matched = matched && suit.includes(card.Suit);
      }
      if (cardNumber) {
        matched = matched && cardNumber.includes(card.CardNumber);
      }
      if (name) {
        matched = matched && name.includes(card.GeneralName);
      }
    } else {
      if (suit && card.suit) {
        matched = matched && card.suit.every(cardSuit => suit.includes(cardSuit));
      }
      if (cardNumber && card.cardNumber) {
        matched = matched && card.cardNumber.every(cardNum => cardNumber.includes(cardNum));
      }
      if (name && card.name) {
        matched = matched && card.name.every(cardName => name.includes(cardName));
      }
    }

    return matched;
  }

  public match(card: Card) {
    if (this.matcher === undefined) {
      return false;
    }

    return CardMatcher.match({
      tag: 'card-matcher',
      ...this.matcher,
    }, card);
  }

  public toSocketPassenger(): CardMatcherSocketPassenger {
    return {
      ...this.matcher,
      tag: 'card-matcher',
    };
  }
}
