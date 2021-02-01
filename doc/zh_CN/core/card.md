# Card Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > Card

___

Card类用来代表游戏中的卡牌。卡牌指的是游戏牌，而不是武将牌、体力牌、身份牌（晕）

[查看源文件...](../../src/core/cards/card.ts)

子类：

- [Card Class](#card-class)
  - [Property Documentation](#property-documentation)
    - [Reforgeable: boolean](#reforgeable-boolean)
    - [Id: CardId](#id-cardid)
    - [CardNumber: number](#cardnumber-number)
    - [Suit: CardSuit](#suit-cardsuit)
    - [Color: CardColor](#color-cardcolor)
    - [Name: string](#name-string)
    - [GeneralName: string](#generalname-string)
    - [Description: string](#description-string)
    - [BaseType: CardType](#basetype-cardtype)
    - [Type: CardType[]](#type-cardtype)
    - [Skill: Skill](#skill-skill)
    - [ShadowSkills: Skill[]](#shadowskills-skill)
    - [EffectUseDistance: number](#effectusedistance-number)
    - [Package: GameCardExtensions](#package-gamecardextensions)
    - [AOE: CardTargetEnum](#aoe-cardtargetenum)
  - [Public Functions](#public-functions)
    - [hasTransformed() => boolean](#hastransformed--boolean)
    - [is(type: CardType) => boolean](#istype-cardtype--boolean)
    - [isSameType(card: Card) => boolean](#issametypecard-card--boolean)
    - [isBlack() => boolean](#isblack--boolean)
    - [isRed() => boolean](#isred--boolean)
    - [isVirtualCard() => boolean](#isvirtualcard--boolean)
    - [equals(card: Readonly\<Card\>) => boolean](#equalscard-readonlycard--boolean)
    - [reset() => void](#reset--void)
  - [Static Public Members](#static-public-members)
    - [getActualCards(cards: CardId[]) => CardId[]](#getactualcardscards-cardid--cardid)
    - [isVirtualCardId(id: CardId) => boolean](#isvirtualcardidid-cardid--boolean)
  - [Related Non-members](#related-non-members)
    - [const enum CardSuit](#const-enum-cardsuit)
    - [const enum CardColor](#const-enum-cardcolor)
    - [type CardId](#type-cardid)
    - [type RealCardId](#type-realcardid)
    - [type VirtualCardId](#type-virtualcardid)
    - [const enum CardTargetEnum](#const-enum-cardtargetenum)
    - [const enum CardType](#const-enum-cardtype)
    - [Decorators](#decorators)
      - [@None](#none)
      - [@Single](#single)
      - [@Multiple](#multiple)
      - [@Others](#others)
      - [@Globe](#globe)

___

## Property Documentation

### Reforgeable: boolean

卡牌能否被重铸。

### Id: [CardId](#type-cardid)

卡牌的id，根据是否是实体卡可能是number或string类型。

### CardNumber: number

卡牌的点数。

### Suit: [CardSuit](#const-enum-cardsuit)

卡牌的花色。

### Color: [CardColor](#const-enum-cardcolor)

卡牌的颜色。

### Name: string

卡牌的名字。

### GeneralName: string

卡牌的一般名字。（待补充）

### Description: string

卡牌的效果描述。

### BaseType: [CardType](#const-enum-cardtype)

卡牌的基本类型。比如武器的基本类型是装备牌。

### Type: [CardType](#const-enum-cardtype)[]

卡牌的类型，有多个值，比如武器的类型是装备牌和武器牌。

### Skill: [Skill](./skill.md)

卡牌对应的技能。

### ShadowSkills: [Skill](./skill.md)[]

卡牌的隐藏技能。

### EffectUseDistance: number

卡牌使用的限定距离，如顺手牵羊只能对距离为1的角色使用。

### Package: GameCardExtensions

卡牌所在的拓展包。

### AOE: [CardTargetEnum](#const-enum-cardtargetenum)

卡牌指定目标的类型。**该属性可修改。**

___

## Public Functions

### hasTransformed() => boolean

卡牌是否是转化牌。

### is(type: [CardType](#const-enum-cardtype)) => boolean

判断卡牌是否为某一类型。

### isSameType(card: [Card](#card-class)) => boolean

判断卡牌和另一张卡牌是否类型一致。需要完全一致才能返回true，例如将武器和防具比较会返false。

### isBlack() => boolean

卡牌是否为黑色。

### isRed() => boolean

卡牌是否为红色。

### isVirtualCard() => boolean

卡牌是否为虚拟牌。

### equals(card: Readonly\<[Card](#card-class)\>) => boolean

卡牌是否与另一张卡牌的花色、点数、牌名都一致。

### reset() => void

将卡牌的指定目标类型重置为其原本的类型。

___

## Static Public Members

### getActualCards(cards: [CardId](#type-cardid)[]) => CardId[]

根据给定的id返回对应各实体卡的id。

### isVirtualCardId(id: [CardId](#type-cardid)) => boolean

判断一个CardId是否是虚拟卡的id。

___

## Related Non-members

### const enum CardSuit

该枚举表示卡牌的花色。

| 常量             | 值  | 描述   |
| ---------------- | --- | ------ |
| CardSuit.NoSuit  | 0   | 无花色 |
| CardSuit.Spade   | 1   | 黑桃   |
| CardSuit.Heart   | 2   | 红桃   |
| CardSuit.Club    | 3   | 梅花   |
| CardSuit.Diamond | 4   | 方块   |

### const enum CardColor

该枚举表示卡牌的颜色。

| 常量            | 值  | 描述 |
| --------------- | --- | ---- |
| CardColor.Red   | 0   | 红色 |
| CardColor.Black | 1   | 黑色 |
| CardColor.None  | 2   | 无色 |

### type CardId

[RealCardId](#type-realcardid)和[VirtualCardId](#type-virtualcardid)的联合类型。

### type RealCardId

number的别名。

### type VirtualCardId

string的别名。

### const enum CardTargetEnum

该枚举表示卡牌的选择目标类型。

| 常量                    | 值  | 描述       |
| ----------------------- | --- | ---------- |
| CardTargetEnum.None     | 0   | 无目标     |
| CardTargetEnum.Single   | 1   | 单目标     |
| CardTargetEnum.Multiple | 2   | 手动多目标 |
| CardTargetEnum.Others   | 3   | 其他       |
| CardTargetEnum.Globe    | 4   | 对所有角色 |

### const enum CardType

该枚举表示卡牌的类型。

| 常量                  | 值  | 描述     |
| --------------------- | --- | -------- |
| CardType.Basic        | 0   | 基本牌   |
| CardType.Equip        | 1   | 装备牌   |
| CardType.Weapon       | 2   | 武器牌   |
| CardType.Armor        | 3   | 防具牌   |
| CardType.OffenseRide  | 4   | 攻击马   |
| CardType.DefenseRide  | 5   | 防御马   |
| CardType.Precious     | 6   | 宝物牌   |
| CardType.Trick        | 7   | 锦囊牌   |
| CardType.DelayedTrick | 8   | 延时锦囊 |

### Decorators

以下的装饰器在卡牌继承Card类或其子类时被用到，会改变目标卡牌的[AOE](#aoe-cardtargetenum)属性。

#### @None

#### @Single

#### @Multiple

#### @Others

#### @Globe
