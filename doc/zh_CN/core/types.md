# Types

> [DSanguosha](../index.md) > [Core](./core-index.md) > [Shared](./shared-index.md) > Types

___

本文档针对shares/types文件夹下的相关文件进行描述。有些文件中仅包含一个枚举类型，故在相关标题下直接列出枚举表。

- [Types](#types)
  - [Flavor](#flavor)
  - [MarkEnum](#markenum)
  - [GameMode](#gamemode)
  - [Server Types](#server-types)
    - [LobbySocketEvent](#lobbysocketevent)
    - [type LobbySocketEventPicker\<E extends LobbySocketEvent\>](#type-lobbysocketeventpickere-extends-lobbysocketevent)
    - [type RoomInfo](#type-roominfo)
      - [name](#name)
      - [activePlayers](#activeplayers)
      - [totalPlayers](#totalplayers)
      - [status](#status)
      - [packages](#packages)
      - [id](#id)
      - [gameMode](#gamemode-1)
      - [passcode](#passcode)
  - [TagEnum](#tagenum)

___

## Flavor

[查看源文件](../../src/core/shares/types/host_config.ts)

| 常量        | 值       | 描述              |
| ----------- | -------- | ----------------- |
| Flavor.Dev  | `'dev'`  | App以调试模式运行 |
| Flavor.Prod | `'prod'` | App正常运行       |

___

## MarkEnum

[查看源代码...](../../src/core/shares/types/mark_list.ts)

| 常量               | 值            | 描述                                                 |
| ------------------ | ------------- | ---------------------------------------------------- |
| MarkEnum.Nightmare | `'nightmare'` | “梦魇”标记（[【武魂】](../characters/god.md#武魂)）  |
| MarkEnum.DaWu      | `'dawu'`      | “大雾”标记（[【大雾】](../characters/god.md#大雾)）  |
| MarkEnum.KuangFeng | `'kuangfeng'` | “狂风”标记（[【狂风】](../characters/god.md#狂风)）  |
| MarkEnum.Ren       | `'ren'`       | “忍”标记（[【忍戒】](../characters/god.md#忍戒)）    |
| MarkEnum.Wrath     | `'nu'`        | “怒”标记（[【狂暴】](../characters/god.md#狂暴)）    |
| MarkEnum.JunLve    | `'junlve'`    | “军略”标记（[【军略】](../characters/god.md#军略)）  |
| MarkEnum.Lie       | `'lie'`       | “烈”标记（[【武烈】](../characters/forest.md#武烈)） |
| MarkEnum.XueYi     | `'xueyi'`     | “血裔”标记（[【血裔】](../characters/fire.md#血裔)） |
| MarkEnum.Ying      | `'ying'`      | “营”标记（[【劫营】](../characters/god.md#劫营)）    |

___

## GameMode

[查看源代码...](../../src/core/shares/types/room_props.ts)

| 常量                  | 值                | 描述     |
| --------------------- | ----------------- | -------- |
| GameMode.Standard     | `'standard-game'` | 身份局   |
| GameMode.OneVersusTwo | `'1v2'`           | 斗地主   |
| GameMode.TwoVersusTwo | `'2v2'`           | 欢乐成双 |
| GameMode.Hegemony     | `'hegemony-game'` | 国战     |

___

## Server Types

### LobbySocketEvent

[查看源代码...](../../src/core/shares/types/server_types.ts)

| 常量                             | 值  | 描述   |
| -------------------------------- | --- | ------ |
| LobbySocketEvent.QueryRoomList   | 0   | 待补充 |
| LobbySocketEvent.GameCreated     | 1   | 待补充 |
| LobbySocketEvent.QueryVersion    | 2   | 待补充 |
| LobbySocketEvent.VersionMismatch | 3   | 待补充 |

参看（待补充）

### type LobbySocketEventPicker\<E extends LobbySocketEvent\>

这个东西能根据不同的LobbySocketEvent返回不同的类型。

### type RoomInfo

该类型描述了一个Room的相关信息。

#### name

string类型，用来保存房间的名称（如“张三 的房间”）

#### activePlayers

number类型，用来保存房间当前活跃玩家数。

#### totalPlayers

number类型，用来保存该房间的总玩家数。

#### status

string类型，可能的取值有'playing'和'waiting'。前者表示该房间已经在进行游戏，后者表示该房间尚在等待状态。

#### packages

保存该房间启用的武将包。

参看[GameCharacterExtensions](./types.md)。

#### id

[RoomId](./types.md)类型，保存该房间的编号。

#### gameMode

[GameMode](#gamemode)类型，保存该房间的游戏模式。

#### passcode

string类型，保存该房间的密码。（可选）

## TagEnum

[查看源代码...](../../src/core/shares/types/tag_list.ts)

| 常量             | 值             | 描述                 |
| ---------------- | -------------- | -------------------- |
| TagEnum.DrunkTag | `'drunkLevel'` | 酒杀中附加的酒的数量 |
