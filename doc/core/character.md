# Character Class

> [DSanguosha](../index.md) > [Core](./core-index.md) > Character

___

Character类是游戏中所有武将的基类。[更多...](#detailed-description)

[查看源文件...](../../src/core/characters/character.ts)

+ [所有属性](#property-documentation)
+ [成员函数](#member-function-documentation)
+ [其他相关](#related-non-members)

___

## Properties

|                        成员 |       | 类型                                                     |
| --------------------------: | :---: | :------------------------------------------------------- |
|                   [Id](#id) |   :   | [CharacterId](#type-characterid)                         |
|               [Name](#name) |   :   | string                                                   |
|           [Gender](#gender) |   :   | [CharacterGender](#const-enum-charactergender)           |
| [Nationality](#nationality) |   :   | [CharacterNationality](#const-enum-characternationality) |
|             [MaxHp](#maxhp) |   :   | number                                                   |
|                   [Hp](#hp) |   :   | number                                                   |
|     [Package](#frompackage) |   :   | GameCharacterExtensions                                  |
|           [Skills](#skills) |   :   | Skill[]                                                  |

___

## Public Functions

|                        函数 |       | 返回类型 |
| --------------------------: | :---: | :------- |
|         [isLord](#islord)() |  =>   | boolean  |
|     [turnOver](#turnover)() |  =>   | void     |
| [isTurnOver](#isturnover)() |  =>   | boolean  |
|             [link](#link)() |  =>   | void     |
|         [unlink](#unlink)() |  =>   | void     |
|     [isLinked](#islinked)() |  =>   | boolean  |

___

## Detailed Description

Character类是所有其他武将的基类。该类保存着武将的基本属性，如编号、势力、性别等。

___

## Property Documentation

### Id: [CharacterId](#type-characterid)
  
  id是武将的编号。在初始化过程中，每名武将被分配到一个与之对应的id。通过id可以找到其对应的武将。

### Name: string

  武将的名字。

### Gender: [CharacterGender](#const-enum-charactergender)

  武将的性别。

### Nationality: [CharacterNationality](#const-enum-characternationality)

  武将的势力（魏蜀吴群神）。

### MaxHp: number

  武将的最大体力值（勾玉数量）。

### Hp: number

  武将的初始体力值（比如神甘宁，3血6上限，其hp值是3）。

### Package: GameCharacterExtensions

  武将所在的拓展包。

### Skills: Skill[]

  武将的所有技能。

___

## Member Function Documentation

### isLord() => boolean

  判断武将是否为主公武将。

### turnOver() => void

  将武将的[turnedOver](#turnedover)属性置为与原来相反，相当于翻面。

### isTurnOver() => boolean

  判断武将是否被翻面。

### link() => void

  将武将的[linked](#linked)属性置为`true`。

### unlink() => void

  将武将的[linked](#linked)属性置为`false`。

### isLinked() => boolean

  判断武将是否处于连环状态。

___

## Related Non-members

### type CharacterId

number的别名。

### const enum CharacterGender

  武将的属性gender即为此类型。

  | 常量                    | 值  | 描述 |
  | ----------------------- | --- | ---- |
  | CharacterGender.Male    | 0   | 男性 |
  | CharacterGender.Female  | 1   | 女性 |
  | CharacterGender.Neutral | 2   | 中性 |

  转为字符串的函数：`getGenderRawText(gender)`

### const enum CharacterNationality

  武将的属性nationality即为此类型。
  
  | 常量                     | 值  | 描述   |
  | ------------------------ | --- | ------ |
  | CharacterNationality.Wei | 0   | 魏势力 |
  | CharacterNationality.Shu | 1   | 蜀势力 |
  | CharacterNationality.Wu  | 2   | 吴势力 |
  | CharacterNationality.Qun | 3   | 群势力 |
  | CharacterNationality.God | 4   | 神势力 |

  转为字符串的函数：`getNationalityRawText(nationality)`

### Decorators

#### @Lord

  在其他武将继承时使用@Lord装饰器以表示其是主公武将。

___

参考：[Skill](./skill.md)，[Extension](./extension.md)
