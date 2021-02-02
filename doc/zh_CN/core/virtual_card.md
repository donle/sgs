# Virtual Card Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > VirtualCard

___

虚拟卡与实体卡相对，是在游戏中实际不存在的卡牌。例如八卦卡直接打出或使用的无实体卡的闪是虚拟牌，武圣中将红色牌当杀使用或打出，武圣的杀也属于虚拟牌。

[查看源代码...](../../../src/core/cards/card.ts)

父类：[Card](./card.md)

- [Virtual Card Class](#virtual-card-class)
  - [Properties Documentation](#properties-documentation)
    - [Suit: CardSuit](#suit-cardsuit)
    - [Color: CardColor](#color-cardcolor)
    - [CardNumber: number](#cardnumber-number)
    - [BaseType: CardType](#basetype-cardtype)
    - [Reforgeable: boolean](#reforgeable-boolean)
    - [Id: VirtualCardId](#id-virtualcardid)
    - [GeneratedBySkill: string](#generatedbyskill-string)
    - [ActualCardIds: CardId[]](#actualcardids-cardid)
    - [Skill: Skill](#skill-skill)
    - [ViewAsCard: ReadOnly\<T>](#viewascard-readonlyt)
  - [Public Functions](#public-functions)
    - [constructor](#constructor)
    - [isBlack() => boolean](#isblack--boolean)
    - [isRed() => boolean](#isred--boolean)
    - [isActualCardHidden() => boolean](#isactualcardhidden--boolean)
    - [isVirtualCard() => boolean](#isvirtualcard--boolean)
    - [findByGeneratedSkill(skillName: string) => boolean](#findbygeneratedskillskillname-string--boolean)
  - [Static Public Members](#static-public-members)
    - [parseId(cardId: VirtualCardId) => VirtualCard\<Card>](#parseidcardid-virtualcardid--virtualcardcard)
    - [create\<T extends Card>(...) => VirtualCard\<T>](#createt-extends-card--virtualcardt)
___

## Properties Documentation

### Suit: [CardSuit](./card.md#const-enum-cardsuit)

虚拟卡的花色。**该属性可在初始化后修改。**

### Color: [CardColor](./card.md#const-enum-cardcolor)

虚拟卡的颜色。

### CardNumber: number

虚拟卡的点数。**该属性可在初始化后修改。**

### BaseType: [CardType](./card.md#const-enum-cardtype)

虚拟卡的基本类型。

### Reforgeable: boolean

虚拟卡能否重铸。

### Id: [VirtualCardId](./card.md#type-vitualcardid)

虚拟卡的id。

### GeneratedBySkill: string

生成该虚拟卡所涉及的技能。

### ActualCardIds: [CardId](./card.md#type-cardid)[]

虚拟卡的实体卡的id列表。

### Skill: [Skill](./skill.md)

虚拟卡对应的卡牌技能。

### ViewAsCard: ReadOnly\<T>

跟虚拟卡绑定的卡牌的“类”类型（跟构造虚拟卡时尖括号内填的类名有关）。

___

## Public Functions

### constructor

```typescript
constructor(
    viewAsOptions: {
      cardName: string;
      cardSuit?: CardSuit;
      cardNumber?: number;
      bySkill: string;
      hideActualCard?: boolean;
    },
    private cardIds: CardId[],
    skill?: Skill,
  ) => VirtualCard<T>;
```

根据这些信息创建虚拟卡并完善其属性。

### isBlack() => boolean

虚拟卡是否为黑色。

### isRed() => boolean

虚拟卡是否为红色。

### isActualCardHidden() => boolean

卡牌是否卡背向上（蛊惑）。

### isVirtualCard() => boolean

是否为虚拟卡（永远返回true）

### findByGeneratedSkill(skillName: string) => boolean

该卡牌是否因为某某技能生成。

___

## Static Public Members

### parseId(cardId: VirtualCardId) => VirtualCard\<[Card](./card.md)>

根据id生成一张虚拟卡。

### create\<T extends [Card](./card.md)>(...) => VirtualCard\<T>

调用构造函数创建新的虚拟卡（参数表与构造函数一致）。
