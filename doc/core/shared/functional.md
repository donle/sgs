# Functional

> [DSanguosha](../../index.md) > [Core](../core-index.md) > [Shared](./shared-index.md) > Functional

___

Functional为一个抽象类，内含多种实用方法（主要是枚举值和字符串的相互转化）。

[查看源文件...](../../../src/core/shares/libs/functional/index.ts)

- [Functional](#functional)
  - [getPlayerPhaseRawText](#getplayerphaserawtext)
  - [getPlayerCardAreaText](#getplayercardareatext)
  - [getCardSuitRawText](#getcardsuitrawtext)
  - [getPlayerRoleRawText](#getplayerrolerawtext)
  - [getPlayerNationalityText](#getplayernationalitytext)
  - [getPlayerNationalityEnum(nationality: string)](#getplayernationalityenumnationality-string)
  - [getCardTypeRawText](#getcardtyperawtext)

## getPlayerPhaseRawText

  原型：`getPlayerPhaseRawText(stage: PlayerPhase)`

  功能：根据PlayerPhase返回相应的字符串。

  参看PlayerPhase。

## getPlayerCardAreaText

  原型：`getPlayerCardAreaText(area: PlayerCardsArea)`

  功能：根据PlayerCardsArea返回相应的字符串。

  参看PlayerCardsArea。

## getCardSuitRawText

  原型：`getCardSuitRawText(suit: CardSuit)`

  功能：根据CardSuit返回相应的字符串。

  参看CardSuit。

## getPlayerRoleRawText

  原型：`getPlayerRoleRawText(role: PlayerRole, mode: GameMode)`

  功能：根据PlayerRole和GameMode返回PlayerRole对应的字符串。

  参看PlayerRole，GameMode。

## getPlayerNationalityText

  原型：`getPlayerNationalityText(nationality: CharacterNationality)`

  功能：根据CharacterNationality返回相应的字符串。

  参看[CharacterNationality](../character.md#const-enum-characternationality)。

## getPlayerNationalityEnum(nationality: string)

  原型：`getPlayerNationalityEnum(nationality: string)`

  功能：根据nationality字符串返回相应的枚举值。

  参看[CharacterNationality](../character.md#const-enum-characternationality)。

## getCardTypeRawText

  原型：`getCardTypeRawText(type: CardType)`

  功能：根据CardType返回相应的字符串。

  参看CardType。
