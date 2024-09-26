# Card Matcher Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > CardMatcher

___

CardMatcher被用来判断某某卡牌是否能符合一定的限制条件。

[查看源文件...](../../../src/core/cards/libs/card_matcher.ts)

- [Card Matcher Class](#card-matcher-class)
  - [Properties Documentation](#properties-documentation)
    - [Matcher: CardMatcherProps](#matcher-cardmatcherprops)
  - [Public Functions](#public-functions)
    - [constructor(private matcher: CardMatcherProps) => [CardMatcher](#card-matcher-class)](#constructorprivate-matcher-cardmatcherprops--cardmatcher)
    - [with(matcher: CardMatcher | [CardMatcherProps](#type-cardmatcherprops)) => this](#withmatcher-cardmatcher--cardmatcherprops--this)
    - [without(matcher: CardMatcher | [CardMatcherProps](#type-cardmatcherprops)) => this](#withoutmatcher-cardmatcher--cardmatcherprops--this)
    - [match(card: Card | [CardMatcher](#card-matcher-class)) => boolean](#matchcard-card--cardmatcher--boolean)
    - [notMatch(card: Card | [CardMatcher](#card-matcher-class)) => boolean](#notmatchcard-card--cardmatcher--boolean)
    - [toSocketPassenger() => CardMatcherSocketPassenger](#tosocketpassenger--cardmatchersocketpassenger)
    - [toString() => string](#tostring--string)
  - [Static Public Members](#static-public-members)
    - [addTag(matcher: CardMatcherProps) => [CardMatcherSocketPassenger](#type-cardmatchersocketpassenger)](#addtagmatcher-cardmatcherprops--cardmatchersocketpassenger)
    - [match(matcher: CardMatcherSocketPassenger, card: [Card](./card.md) | [CardMatcher](#card-matcher-class)) => boolean](#matchmatcher-cardmatchersocketpassenger-card-card--cardmatcher--boolean)
    - [notMatch(matcher: CardMatcherSocketPassenger, card: [Card](./card.md) | [CardMatcher](#card-matcher-class)) => boolean](#notmatchmatcher-cardmatchersocketpassenger-card-card--cardmatcher--boolean)
    - [parse(cardPattern: string) => CardMatcher](#parsecardpattern-string--cardmatcher)
  - [Related Non-members](#related-non-members)
    - [type CardMatcherProps](#type-cardmatcherprops)
    - [type CardMatcherSocketPassenger](#type-cardmatchersocketpassenger)

___

## Properties Documentation

### Matcher: [CardMatcherProps](#type-cardmatcherprops)

CardMatcher的主要属性，存储着和卡牌比对的必要信息。

___

## Public Functions

### constructor(private matcher: [CardMatcherProps](#type-cardmatcherprops)) => [CardMatcher](#card-matcher-class)

构造函数。参数matcher被赋予属性Matcher。

### with(matcher: [CardMatcher](#card-matcher-class) | [CardMatcherProps](#type-cardmatcherprops)) => this

将Matcher的限制条件扩大（追加另一个matcher的信息）。

### without(matcher: [CardMatcher](#card-matcher-class) | [CardMatcherProps](#type-cardmatcherprops)) => this

将Matcher的限制条件缩小（去掉另一个matcher的信息）。

### match(card: [Card](./card.md) | [CardMatcher](#card-matcher-class)) => boolean

判断某card是否能符合Matcher的条件。

### notMatch(card: [Card](./card.md) | [CardMatcher](#card-matcher-class)) => boolean

判断某card是否不符合Matcher的条件。

### toSocketPassenger() => [CardMatcherSocketPassenger](#type-cardmatchersocketpassenger)

返回Matcher的[CardMatcherSocketPassenger](#type-cardmatchersocketpassenger)版本。

### toString() => string

返回Matcher的JSON字符串版本。

___

## Static Public Members

### addTag(matcher: [CardMatcherProps](#type-cardmatcherprops)) => [CardMatcherSocketPassenger](#type-cardmatchersocketpassenger)

以matcher为条件返回一个[CardMatcherSocketPassenger](#type-cardmatchersocketpassenger)。

### match(matcher: [CardMatcherSocketPassenger](#type-cardmatchersocketpassenger), card: [Card](./card.md) | [CardMatcher](#card-matcher-class)) => boolean

[match](#matchcard-card--cardmatcher--boolean)的静态版本。

### notMatch(matcher: [CardMatcherSocketPassenger](#type-cardmatchersocketpassenger), card: [Card](./card.md) | [CardMatcher](#card-matcher-class)) => boolean

[notMatch](#notmatchcard-card--cardmatcher--boolean)的静态版本。

### parse(cardPattern: string) => [CardMatcher](#card-matcher-class)

根据JSON字符串返回新的CardMatcher。

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
