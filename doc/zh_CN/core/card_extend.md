# Card的其他几大子类

> [DSanguosha](../index.md) > [Core](./core_index.md) > CardExtend

___

本文档叙述Core种除VirtualCard外其他几大子类（基本牌、锦囊牌、装备牌）。只叙述基于他们父类的拓展。

父类：[Card](./card.md)

- [Card的其他几大子类](#card的其他几大子类)
  - [BasicCard](#basiccard)
  - [TrickCard](#trickcard)
    - [Decorator](#decorator)
      - [@DelayedTrick](#delayedtrick)
  - [EquipCard](#equipcard)
    - [WeaponCard](#weaponcard)
      - [AttackDistance](#attackdistance)
    - [ArmorCard](#armorcard)
    - [PreciousCard](#preciouscard)
    - [RideCard](#ridecard)
      - [DefenseRideCard](#defenseridecard)
      - [OffenseRideCard](#offenseridecard)

___

## BasicCard

[查看源文件...](../../../src/core/cards/basic_card.ts)

基本牌。[BaseType](./card.md#basetype-cardtype)属性为[CardType](./card.md#const-enum-cardtype).Basic。

___

## TrickCard

[查看源文件...](../../../src/core/cards/trick_card.ts)

锦囊牌。[BaseType](./card.md#basetype-cardtype)属性为[CardType](./card.md#const-enum-cardtype).Trick。

### Decorator

#### @DelayedTrick

加上该装饰器表示此卡为延时锦囊（[Type](./card.md#type-cardtype)属性追加了[CardType](./card.md#const-enum-cardtype).DelayedTrick）。

___

## EquipCard

[查看源文件...](../../../src/core/cards/equip_card.ts)

装备牌。[BaseType](./card.md#basetype-cardtype)属性为[CardType](./card.md#const-enum-cardtype).Trick。

### WeaponCard

武器牌。[Type](./card.md#type-cardtype)属性追加了[CardType](./card.md#const-enum-cardtype).Weapon。

#### AttackDistance

新的属性，表示该武器的攻击距离。

### ArmorCard

防具牌。[Type](./card.md#type-cardtype)属性追加了[CardType](./card.md#const-enum-cardtype).Armor。

### PreciousCard

宝物牌。[Type](./card.md#type-cardtype)属性追加了[CardType](./card.md#const-enum-cardtype).Precious。

### RideCard

坐骑牌。[Skill](./skill.md)属性的类型改为RulesBreakerSkill。

#### DefenseRideCard

+1马。[Type](./card.md#type-cardtype)属性追加了[CardType](./card.md#const-enum-cardtype).DefenseRide。

#### OffenseRideCard

-1马。[Type](./card.md#type-cardtype)属性追加了[CardType](./card.md#const-enum-cardtype).OffenseRide。
