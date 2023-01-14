# Precondition

> [DSanguosha](../index.md) > [Core](./core_index.md) > [Shared](./shared_index.md) > Precondition

___

Precondition类中定义了诸如assert等常用函数。

[查看源文件...](../../../src/core/shares/libs/precondition/precondition.ts)

- [Precondition](#precondition)
  - [alarm](#alarm)
  - [exists](#exists)
  - [assert](#assert)
  - [UnreachableError](#unreachableerror)

___

## alarm

  原型： `alarm<T>(arg: T | null | undefined, errorMsg: string): T`

  功能：若arg为null或undefined，则在控制台输出errorMsg。

## exists

  原型：`exists<T>(arg: T | null | undefined, errorMsg: string): T`

  功能：若arg为null或undefined，则以errorMsg返回Error。

## assert

  原型：`assert(success: boolean, errorMsg: string)`

  功能：若success为false，则以errorMsg返回Error。

## UnreachableError

  原型：`UnreachableError(arg: never)`

  功能：返回Error表示某某是不可达的（实际运用中用于确保switch能穷尽所有枚举值）。例如在[getCardTypeRawText](#getcardtyperawtext)函数中传入了CardType以外的值就会触发此错误。
