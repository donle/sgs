# Room Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > Room

___

Description

[查看源代码...](../../../src/core/room/room.ts)

___

## Properties Documentation

### GameParticularAreas: string[]

游戏中特别的区域？目前只返回`['muniuliuma']`（木牛流马）

### AlivePlayers: Player[]

房间内的所有存活玩家。

### Players: PLayer[]

房间内的所有玩家。

### RoomId: RoomId

房间的id。

### Info: RoomInfo

房间的信息。

### Analytics: RecordAnalytics

游戏数据统计。

### Round: number

当前游戏轮数。

### AwaitingResponseEvent

```ts
AwaitingResponseEvent: {
    [x: string]: {
        identifier: GameEventIdentifiers;
        content: EventPicker<GameEventIdentifiers, T>;
    } | undefined;
}
```

___

## Public Functions

___

## Public Members

___

## Protected Members

___

## Static Public Members

___

## Related Non-members

### type RoomId

```ts
export type RoomId = number;
```
