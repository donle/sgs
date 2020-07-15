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
  reverseMatch?: boolean;
} & CardMatcherProps;

export class CardMatcher {
  private matchAll: boolean;
  private reverseMatch: boolean = false;

  constructor(private matcher: CardMatcherProps) {
    if (Object.keys(this.matcher).length === 0) {
      this.matchAll = true;
    }
  }

  public static addTag(matcher: CardMatcherProps): CardMatcherSocketPassenger {
    return {
      tag: 'card-matcher',
      ...matcher,
    };
  }

  public static weakMatch(matcher: CardMatcherSocketPassenger | undefined, card: Card | CardMatcher) {
    if (matcher === undefined) {
      return false;
    }

    Precondition.assert(matcher.tag && matcher.tag === 'card-matcher', 'Invalid card matcher props');
    const { suit, cardNumber, name, type, cards, reverseMatch } = matcher;
    let matched = false;

    if (card instanceof Card) {
      if (suit) {
        matched = matched || suit.includes(card.Suit);
      }
      if (cardNumber) {
        matched = matched || cardNumber.includes(card.CardNumber);
      }
      if (name) {
        matched = matched || name.includes(card.GeneralName);
      }
      if (type) {
        matched = matched || type.find(subType => card.is(subType)) !== undefined;
      }
      if (cards) {
        matched = matched || cards.includes(card.Id);
      }
    } else {
      matcher = card.toSocketPassenger();
      if (suit && matcher.suit) {
        matched = matched || matcher.suit.length === 0 || !!matcher.suit.find(cardSuit => suit.includes(cardSuit));
      }
      if (cardNumber && matcher.cardNumber) {
        matched =
          matched ||
          matcher.cardNumber.length === 0 ||
          !!matcher.cardNumber.find(cardNum => cardNumber.includes(cardNum));
      }
      if (name && matcher.name) {
        matched = matched || matcher.name.length === 0 || !!matcher.name.find(cardName => name.includes(cardName));
      }
      if (type && matcher.type) {
        matched = matched || matcher.type.length === 0 || !!matcher.type.find(cardType => type.includes(cardType));
      }
      if (cards && matcher.cards) {
        matched = matched || matcher.cards.length === 0 || !!matcher.cards.find(innerCard => cards.includes(innerCard));
      }
    }

    return reverseMatch ? !matched : matched;
  }

  public static match(matcher: CardMatcherSocketPassenger | undefined, card: Card | CardMatcher) {
    if (matcher === undefined) {
      return false;
    }

    Precondition.assert(matcher.tag && matcher.tag === 'card-matcher', 'Invalid card matcher props');

    const { suit, cardNumber, name, type, cards, reverseMatch } = matcher;
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
        matched = matched && matcher.suit.length > 0 && matcher.suit.every(cardSuit => suit.includes(cardSuit));
      }
      if (cardNumber && matcher.cardNumber) {
        matched =
          matched && matcher.cardNumber.length > 0 && matcher.cardNumber.every(cardNum => cardNumber.includes(cardNum));
      }
      if (name && matcher.name) {
        matched = matched && matcher.name.length > 0 && matcher.name.every(cardName => name.includes(cardName));
      }
      if (type && matcher.type) {
        matched = matched && matcher.type.length > 0 && matcher.type.every(cardType => type.includes(cardType));
      }
      if (cards && matcher.cards) {
        matched = matched && matcher.cards.length > 0 && matcher.cards.every(innerCard => cards.includes(innerCard));
      }
    }

    return reverseMatch ? !matched : matched;
  }

  public static notMatch(matcher: CardMatcherSocketPassenger | undefined, card: Card | CardMatcher) {
    return !this.match(matcher, card);
  }

  public with(matcher: CardMatcher | CardMatcherProps) {
    if (this.matchAll) {
      return this;
    }

    matcher = matcher instanceof CardMatcher ? matcher.Matcher : matcher;
    const { suit, cardNumber, name, type, cards } = matcher;

    this.matcher.suit = !this.matcher.suit ? suit : suit ? [...this.matcher.suit, ...suit] : this.matcher.suit;
    this.matcher.cardNumber = !this.matcher.cardNumber
      ? cardNumber
      : cardNumber
      ? [...this.matcher.cardNumber, ...cardNumber]
      : this.matcher.cardNumber;
    this.matcher.name = !this.matcher.name ? name : name ? [...this.matcher.name, ...name] : this.matcher.name;
    this.matcher.type = !this.matcher.type ? type : type ? [...this.matcher.type, ...type] : this.matcher.type;
    this.matcher.cards = !this.matcher.cards ? cards : cards ? [...this.matcher.cards, ...cards] : this.matcher.cards;

    this.matchAll = Object.keys(this.matcher).length === 0;

    return this;
  }

  public without(matcher: CardMatcher | CardMatcherProps) {
    if (this.matchAll) {
      this.reverseMatch = true;
      for (const [key, value] of Object.entries(matcher)) {
        this.matcher[key] = value;
      }
      this.matchAll = Object.keys(this.matcher).length === 0;

      return this;
    }

    matcher = matcher instanceof CardMatcher ? matcher.Matcher : matcher;
    const { suit, cardNumber, name, type, cards } = matcher;

    this.matcher.suit = !this.matcher.suit
      ? undefined
      : suit
      ? this.matcher.suit.filter(s => !suit.includes(s))
      : this.matcher.suit;
    this.matcher.cardNumber = !this.matcher.cardNumber
      ? undefined
      : cardNumber
      ? this.matcher.cardNumber.filter(s => !cardNumber.includes(s))
      : this.matcher.cardNumber;
    this.matcher.name = !this.matcher.name
      ? undefined
      : name
      ? this.matcher.name.filter(s => !name.includes(s))
      : this.matcher.name;
    this.matcher.type = !this.matcher.type
      ? undefined
      : type
      ? this.matcher.type.filter(s => !type.includes(s))
      : this.matcher.type;
    this.matcher.cards = !this.matcher.cards
      ? undefined
      : cards
      ? this.matcher.cards.filter(s => !cards.includes(s))
      : this.matcher.cards;

    this.matchAll = Object.keys(this.matcher).length === 0;

    return this;
  }

  public match(card: Card | CardMatcher) {
    return CardMatcher.match(
      {
        tag: 'card-matcher',
        reverseMatch: this.reverseMatch,
        ...this.matcher,
      },
      card,
    );
  }

  public notMatch(card: Card | CardMatcher) {
    return !this.match(card);
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
