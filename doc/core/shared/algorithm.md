# Algorithm

> [DSanguosha](../../index.md) > [Core](../core-index.md) > [Shared](./shared-index.md) > Algorithm

___

Algorithm是一个命名空间，里面包含了一些常用算法。

[查看源文件...](../../../src/core/shares/libs/algorithm/index.ts)

- [Algorithm](#algorithm)
  - [shuffle](#shuffle)
  - [randomPick](#randompick)
  - [randomInt](#randomint)
  - [intersection](#intersection)
  - [isSubsetOf](#issubsetof)

## shuffle
  
  原型：`shuffle<T>(a: T[]): T[]`

  功能：将一个Array打乱。

## randomPick

  原型：`randomPick<T>(pick: number, arr: T[]): T[]`

  功能：从一个Array中随机抽取一定数量的元素。

## randomInt

  原型：`randomInt(from: number, to: number): number`

  功能：在一定范围内生成随机数值。

## intersection

  原型：`intersection<T>(source: T[], scope: T[]): T[]`

  功能：取两个Array的交集。

## isSubsetOf

  原型：`isSubsetOf<T>(source: T[], target: T[]): boolean`

  功能：判断target是不是source的子集。
