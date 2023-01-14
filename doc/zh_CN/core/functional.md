# Functional

> [DSanguosha](../index.md) > [Core](./core_index.md) > [Shared](./shared_index.md) > Functional

___

Functional为一个抽象类，内含多种实用方法（主要是枚举值和字符串的相互转化）。

[查看源文件...](../../../src/core/shares/libs/functional/index.ts)

- [Functional](#functional)
  - [getPlayerPhaseRawText](#getplayerphaserawtext)
  - [getPlayerCardAreaText](#getplayercardareatext)
  - [getCardSuitRawText](#getcardsuitrawtext)
  - [getPlayerRoleRawText](#getplayerrolerawtext)
  - [getPlayerNationalityText](#getplayernationalitytext)
  - [getPlayerNationalityEnum](#getplayernationalityenum)
  - [getCardTypeRawText](#getcardtyperawtext)

___

## getPlayerPhaseRawText

  原型：`getPlayerPhaseRawText(stage: PlayerPhase)`

  功能：根据PlayerPhase返回相应的字符串。

  参看[PlayerPhase](./functional.md)。

## getPlayerCardAreaText

  原型：`getPlayerCardAreaText(area: PlayerCardsArea)`

  功能：根据PlayerCardsArea返回相应的字符串。

  参看[PlayerCardsArea](./functional.md)。

## getCardSuitRawText

  原型：`getCardSuitRawText(suit: CardSuit)`

  功能：根据CardSuit返回相应的字符串。

  参看[CardSuit](./functional.md)。

## getPlayerRoleRawText

  原型：`getPlayerRoleRawText(role: PlayerRole, mode: GameMode)`

  功能：根据PlayerRole和GameMode返回PlayerRole对应的字符串。

  参看[PlayerRole](./functional.md)，[GameMode](./functional.md)。

## getPlayerNationalityText

  原型：`getPlayerNationalityText(nationality: CharacterNationality)`

  功能：根据CharacterNationality返回相应的字符串。

  参看[CharacterNationality](../character.md#const-enum-characternationality)。

## getPlayerNationalityEnum

  原型：`getPlayerNationalityEnum(nationality: string)`

  功能：根据nationality字符串返回相应的枚举值。

  参看[CharacterNationality](../character.md#const-enum-characternationality)。

## getCardTypeRawText

  原型：`getCardTypeRawText(type: CardType)`

  功能：根据CardType返回相应的字符串。

  参看[CardType](./functional.md)。
