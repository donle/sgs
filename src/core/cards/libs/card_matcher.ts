import { Card, CardType } from 'core/cards/card';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CardId, CardSuit } from './card_props';

export type CardMatcherProps = {
  suit?: CardSuit[];
  cardNumber?: number[];
  name?: string[];
  type?: CardType[];
  cards?: CardId[];
};

export type CardMatcherSocketPassenger = {
  tag: 'card-matcher';
} & CardMatcherProps;

export class CardMatcher {
  constructor(private matcher: CardMatcherProps) {}

  public static addTag(matcher: CardMatcherProps): CardMatcherSocketPassenger {
    return {
      tag: 'card-matcher',
      ...matcher,
    };
  }

  public static match(matcher: CardMatcherSocketPassenger | undefined, card: Card | CardMatcher) {
    if (matcher === undefined) {
      return false;
    }

    Precondition.assert(matcher.tag && matcher.tag === 'card-matcher', 'Invalid card matcher props');

    const { suit, cardNumber, name, type, cards } = matcher;
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
      if (type) {
        matched = matched && type.find(subType => card.is(subType)) !== undefined;
      }
      if (cards) {
        matched = matched && cards.includes(card.Id);
      }
    } else {
      matcher = card.toSocketPassenger();
      if (suit && matcher.suit) {
        matched = matched && matcher.suit.every(cardSuit => suit.includes(cardSuit));
      }
      if (cardNumber && matcher.cardNumber) {
        matched = matched && matcher.cardNumber.every(cardNum => cardNumber.includes(cardNum));
      }
      if (name && matcher.name) {
        matched = matched && matcher.name.every(cardName => name.includes(cardName));
      }
      if (type && matcher.type) {
        matched = matched && matcher.type.every(cardType => type.includes(cardType));
      }
      if (cards && matcher.cards) {
        matched = matched && matcher.cards.every(innerCard => cards.includes(innerCard));
      }
    }

    return matched;
  }

  public match(card: Card | CardMatcher) {
    return CardMatcher.match(
      {
        tag: 'card-matcher',
        ...this.matcher,
      },
      card,
    );
  }

  public get Matcher() {
    return this.matcher;
  }

  public toSocketPassenger(): CardMatcherSocketPassenger {
    return {
      ...this.matcher,
      tag: 'card-matcher',
    };
  }

  public toString() {
    return JSON.stringify(this.match);
  }

  public static parse(cardPattern: string) {
    return new CardMatcher(JSON.parse(cardPattern));
  }
}
