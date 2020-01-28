import { Card } from 'core/cards/card';
import { CardSuit } from './card_props';

export type CardMatcherProps = {
  suit?: CardSuit[];
  cardNumber?: number[];
  name?: string[];
};

export type CardMatcherSocketPassenger = {
  tag: 'card-matcher';
} & CardMatcherProps;

export class CardMatcher {
  constructor(private matcher?: CardMatcherProps) {}

  public static match(matcher: CardMatcherSocketPassenger, card: Card) {
    if (matcher.tag && matcher.tag !== 'card-matcher') {
      throw new Error('Invalid card matcher props');
    }

    const { suit, cardNumber, name } = matcher;
    let matched = true;

    if (suit) {
      matched = matched && suit.includes(card.Suit);
    }
    if (cardNumber) {
      matched = matched && cardNumber.includes(card.CardNumber);
    }
    if (name) {
      matched = matched && name.includes(card.GeneralName);
    }
  }

  public match(card: Card) {
    if (this.matcher === undefined) {
      return true;
    }

    const { suit, cardNumber, name } = this.matcher;
    let matched = true;

    if (suit) {
      matched = matched && suit.includes(card.Suit);
    }
    if (cardNumber) {
      matched = matched && cardNumber.includes(card.CardNumber);
    }
    if (name) {
      matched = matched && name.includes(card.GeneralName);
    }
  }

  public toSocketPassenger(): CardMatcherSocketPassenger {
    return {
      ...this.matcher,
      tag: 'card-matcher',
    };
  }
}
