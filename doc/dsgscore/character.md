# Character Class

> [dsanguosha](../index.md) > [dsgscore](./dsgscore-index.md) > character

___

Character类是游戏中所有武将的基类。[更多...](#detailed-description)

+ [所有属性](#property-documentation)
+ [成员函数](#member-function-documentation)
+ [其他相关](#related-non-members)

___

Private Members | | |
 -: | :-: | :-
[turnedOver](#turnedover) | : | boolean
[linked](#linked) | : | boolean
[lord](#lord) | : | boolean

___

Protected Members | | |
 -: | :-: | :-
[id](#id) | : | CharacterId
[name](#name) | : | string
[gender](#gender) | : | CharacterGender
[nationality](#nationality) | : | CharacterNationality
[maxHp](#maxhp) | : | number
[hp](#hp) | : | number
[fromPackage](#frompackage) | : | GameCharacterExtensions
[skills](#skills) | : | Skill[]

___

Public Functions | | |
 -: | :-: | :-

+ isLord()
+ turnOver()
+ isTurnOver()
+ link()
+ unlink()
+ isLinked()

___

Property Getters | | |
 -: | :-: | :-

+ Id
+ MaxHp
+ Hp
+ Nationality
+ Skills
+ Name
+ Package
+ Gender

___

## Detailed Description

Character类是所有其他武将的基类。（待补充）

___

## Property Documentation

### id
  
  id是武将的编号。在初始化过程中，每名武将被分配到一个与之对应的id。通过id可以找到其对应的武将。

### name

  武将的名字。

### gender

  武将的性别。

### nationality

  武将的势力（魏蜀吴群神）。

### maxHp

  武将的最大体力值（勾玉数量）。

### hp

  武将的初始体力值（比如神甘宁，3血6上限，其hp值是3）。

### fromPackage

  武将所在的拓展包。

### skills

  武将的所有技能。

### turnedOver

  是否被翻面。

### linked

  是否处于连环状态。

### lord

  是否是主公。

___

## Member Function Documentation

（待补充）

___

## Related Non-members

+ `const enum CharacterGender`

  共有3种取值：Male，Female，Neutral。武将的属性gender即为此类型。
  转为字符串的函数：`getGenderRawText(gender)`

+ `const enum CharacterNationality`

  共有5种取值：Wei，Shu，Wu，Qun，God。武将的属性nationality即为此类型。
  转为字符串的函数：`getNationalityRawText(nationality)`

+ 装饰器函数：Lord

  在其他武将继承时使用@Lord装饰器以表示其是主公武将。

___

参考：[Skill](./skill.md)，[Extension](./extension.md)
