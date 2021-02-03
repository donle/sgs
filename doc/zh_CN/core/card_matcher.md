# Card Matcher Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > CardMatcher

___

## Properties Documentation

### Matcher: CardMatcherProps

___

## Public Functions

### constructor

### with(matcher: CardMatcher | CardMatcherProps) => this

### without(matcher: CardMatcher | CardMatcherProps) => this

### match(card: Card | CardMatcher) => boolean

### notMatch(card: Card | CardMatcher) => boolean

### toSocketPassenger() => CardMatcherSocketPassenger

### toString() => string

___

## Static Public Members

### addTag(matcher: CardMatcherProps) => CardMatcherSocketPassenger

### match(matcher: CardMatcherSocketPassenger, card: Card | CardMatcher) => boolean

### notMatch(matcher: CardMatcherSocketPassenger, card: Card | CardMatcher) => boolean

### parse(cardPattern: string) => CardMatcher

___

## Related Non-members

### type CardMatcherProps

```typescript
export type CardMatcherProps = {
  suit?: CardSuit[];
  cardNumber?: number[];
  name?: string[];
  generalName?: string[];
  type?: CardType[];
  cards?: CardId[];
};
```

### type CardMatcherSocketPassenger

```typescript
export type CardMatcherSocketPassenger = {
  tag: 'card-matcher';
  reverseMatch?: boolean;
} & CardMatcherProps;
```
