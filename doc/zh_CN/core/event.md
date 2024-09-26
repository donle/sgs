# Event

> [DSanguosha](../index.md) > [Core](./core_index.md) > Event

___

## Static Public Members

### wrapGameRunningInfo

```ts
static wrapGameRunningInfo<T extends GameEventIdentifiers>(
  event: ServerEventFinder<T>,
  info: GameRunningInfo,
) => ServerEventFinder<T>
```

将event和info合并成一个新对象。

### getGameRunningInfo

```ts
static getGameRunningInfo<T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => GameRunningInfo
```

获得该event的GameRunningInfo。

### minifyPayload

```ts
static minifyPayload = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => any
```

返回event去掉middleware后的结果。

### setTimestamp

```ts
static setTimestamp = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => void
```

将event的timestamp设置为当前时间。

### getTimestamp

```ts
static getTimestamp = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => number | undefined
```

获得event的timestamp。

### isDisresponsiveEvent

```ts
static isDisresponsiveEvent = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => boolean
```

### setDisresponsiveEvent

```ts
static setDisresponsiveEvent = <T extends GameEventIdentifiers>(
  event: ServerEventFinder<T>,
) => ServerEventFinder<T>
```

### addMiddleware

```ts
static addMiddleware = <T extends GameEventIdentifiers>(
  middleware: {
    tag: string;
    data: any;
  },
  event: ServerEventFinder<T>,
) => ServerEventFinder<T>
```

### getMiddleware

```ts
static getMiddleware = <DataType>(
  tag: string,
  event: ServerEventFinder<GameEventIdentifiers>,
) => DataType | undefined
```

### removeMiddleware

```ts
static removeMiddleware = <T extends GameEventIdentifiers>(
  tag: string,
  event: ServerEventFinder<T>,
) => ServerEventFinder<T>
```

### createUncancellableEvent

```ts
static createUncancellableEvent = <T extends GameEventIdentifiers>(
  event: ServerEventFinder<T>,
) => ServerEventFinder<T>
```

### createIdentifierEvent

```ts
static createIdentifierEvent = <
  T extends GameEventIdentifiers,
  E extends ServerEventFinder<T> | ClientEventFinder<T>
>(
  identifier: T,
  event: E,
) => E
```

### hasIdentifier

```ts
static hasIdentifier = <T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) => boolean
```

### getIdentifier

```ts
static getIdentifier = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => T | undefined
```

### isUncancellabelEvent

```ts
static isUncancellabelEvent = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => boolean
```

### terminate

```ts
static terminate<T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => ServerEventFinder<T>
```

### recall

```ts
static recall<T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => ServerEventFinder<T>
```

### isTerminated

```ts
static isTerminated(event: ServerEventFinder<GameEventIdentifiers>) => boolean
```

### copyPropertiesTo

```ts
static copyPropertiesTo<T extends GameEventIdentifiers, Y extends GameEventIdentifiers>(
  fromEvent: ServerEventFinder<T>,
  toEvent: ServerEventFinder<Y>,
  configuration: {
    copyTerminate?: boolean;
    copyUncancellable?: boolean;
    copyMiddlewares?: boolean;
    copyDisresponsive?: boolean;
  } = {},
) => void
```

### setDamageSignatureInCardUse

```ts
static setDamageSignatureInCardUse(
  content:
    | ServerEventFinder<GameEventIdentifiers.CardUseEvent>
    | ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  sign: boolean = true,
) => void
```

### getDamageSignatureInCardUse

```ts
static getDamageSignatureInCardUse(
  content:
    | ServerEventFinder<GameEventIdentifiers.CardUseEvent>
    | ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
) => boolean
```

___

## Related Non-members

### const enum GameEventIdentifiers

游戏中的所有事件。

| 常量                                                        | 值  | 描述                                         |
| ----------------------------------------------------------- | --- | -------------------------------------------- |
| GameEventIdentifiers.UserMessageEvent                       | 100 | 通知各客户端任一玩家的发言                   |
| GameEventIdentifiers.PlayerStatusEvent                      | 101 | 通知各客户端显示玩家当前游戏状态（如：离线） |
| GameEventIdentifiers.NotifyEvent                            | 102 | 请求响应操作事件                             |
| GameEventIdentifiers.CustomGameDialog                       | 103 | 通知各客户端显示自定log消息                  |
| GameEventIdentifiers.PhaseChangeEvent                       | 104 | 阶段变化事件                                 |
| GameEventIdentifiers.PhaseStageChangeEvent                  | 105 | 阶段内时机点切换事件                         |
| GameEventIdentifiers.SyncGameCommonRulesEvent               | 106 | 游戏规则变动事件                             |
| GameEventIdentifiers.PlayerPropertiesChangeEvent            | 107 | 角色属性变更事件                             |
| GameEventIdentifiers.SetOutsideCharactersEvent              | 108 | 通知各客户端显示被除外卡牌                   |
| GameEventIdentifiers.HuaShenCardUpdatedEvent                | 109 | 通知各客户端当前化身武将及技能               |
| GameEventIdentifiers.UpgradeSideEffectSkillsEvent           | 110 | 通知客户端装载附属技能（如：制霸）           |
| GameEventIdentifiers.SetFlagEvent                           | 111 | 通知客户端设置flag                           |
| GameEventIdentifiers.RemoveFlagEvent                        | 112 | 通知客户端移除flag                           |
| GameEventIdentifiers.ClearFlagEvent                         | 113 | 通知客户端清除flag                           |
| GameEventIdentifiers.AddMarkEvent                           | 114 | 通知客户端添加标记                           |
| GameEventIdentifiers.SetMarkEvent                           | 115 | 通知客户端设置标记                           |
| GameEventIdentifiers.RemoveMarkEvent                        | 116 | 通知客户端移除标记                           |
| GameEventIdentifiers.ClearMarkEvent                         | 117 | 通知客户端清除标记                           |
| GameEventIdentifiers.DrunkEvent                             | 118 | 通知显示/清除使用【酒】后的脸红效果          |
| GameEventIdentifiers.ChainLockedEvent                       | 119 | 角色横置/重置事件                            |
| GameEventIdentifiers.LoseSkillEvent                         | 120 | 失去技能事件                                 |
| GameEventIdentifiers.ObtainSkillEvent                       | 121 | 获得技能事件                                 |
| GameEventIdentifiers.ReforgeEvent                           | 122 | 重铸事件                                     |
| GameEventIdentifiers.CardResponseEvent                      | 123 | 卡牌响应事件                                 |
| GameEventIdentifiers.CardUseEvent                           | 124 | 卡牌使用事件                                 |
| GameEventIdentifiers.CardEffectEvent                        | 125 | 卡牌生效事件                                 |
| GameEventIdentifiers.CardDisplayEvent                       | 126 | 展示卡牌事件                                 |
| GameEventIdentifiers.DrawCardEvent                          | 127 | 摸牌事件                                     |
| GameEventIdentifiers.MoveCardEvent                          | 128 | 移动卡牌事件                                 |
| GameEventIdentifiers.ObserveCardsEvent                      | 129 | 请求执行明牌选择操作                         |
| GameEventIdentifiers.ObserveCardFinishEvent                 | 130 | 停止明牌选择操作                             |
| GameEventIdentifiers.AimEvent                               | 131 | 指定/成为目标事件                            |
| GameEventIdentifiers.SkillUseEvent                          | 132 | 技能发动事件                                 |
| GameEventIdentifiers.SkillEffectEvent                       | 133 | 技能生效事件                                 |
| GameEventIdentifiers.PinDianEvent                           | 134 | 拼点事件                                     |
| GameEventIdentifiers.LoseHpEvent                            | 135 | 失去体力事件                                 |
| GameEventIdentifiers.ChangeMaxHpEvent                       | 136 | 体力上限变更事件                             |
| GameEventIdentifiers.DamageEvent                            | 137 | 伤害事件                                     |
| GameEventIdentifiers.RecoverEvent                           | 138 | 回复事件                                     |
| GameEventIdentifiers.HpChangeEvent                          | 139 | 体力变更事件                                 |
| GameEventIdentifiers.JudgeEvent                             | 140 | 判定事件                                     |
| GameEventIdentifiers.GameReadyEvent                         | 141 | 游戏准备时                                   |
| GameEventIdentifiers.GameStartEvent                         | 142 | 游戏开始时                                   |
| GameEventIdentifiers.GameOverEvent                          | 143 | 游戏结束时                                   |
| GameEventIdentifiers.PlayerEnterRefusedEvent                | 144 | 拒绝玩家进入房间事件                         |
| GameEventIdentifiers.PlayerReenterEvent                     | 145 | 断线重连事件                                 |
| GameEventIdentifiers.PlayerBulkPacketEvent                  | 146 | （待补充）                                   |
| GameEventIdentifiers.PlayerEnterEvent                       | 147 | 玩家进入事件                                 |
| GameEventIdentifiers.PlayerLeaveEvent                       | 148 | 玩家离开事件                                 |
| GameEventIdentifiers.PlayerDyingEvent                       | 149 | 角色濒死事件                                 |
| GameEventIdentifiers.PlayerDiedEvent                        | 150 | 角色死亡事件                                 |
| GameEventIdentifiers.PhaseSkippedEvent                      | 151 | 阶段跳过后                                   |
| GameEventIdentifiers.PlayerChainedEvent                     | 152 | （待补充）                                   |
| GameEventIdentifiers.PlayerTurnOverEvent                    | 153 | 角色翻面事件                                 |
| GameEventIdentifiers.AskForPlayCardsOrSkillsEvent           | 154 | 出牌阶段空闲时间点请求使用卡牌或技能         |
| GameEventIdentifiers.AskForPeachEvent                       | 155 | 濒死求桃事件                                 |
| GameEventIdentifiers.AskForCardResponseEvent                | 156 | 请求打出卡牌                                 |
| GameEventIdentifiers.AskForCardUseEvent                     | 157 | 请求使用卡牌                                 |
| GameEventIdentifiers.AskForCardDisplayEvent                 | 158 | 请求选择自身卡牌展示                         |
| GameEventIdentifiers.AskForCardDropEvent                    | 159 | 请求弃置自身卡牌                             |
| GameEventIdentifiers.AskForCardEvent                        | 160 | 请求选择自身卡牌                             |
| GameEventIdentifiers.AskForPinDianCardEvent                 | 161 | 请求选择手牌用于拼点                         |
| GameEventIdentifiers.AskForChoosingCardEvent                | 162 | 请求选择框内任意数量卡牌                     |
| GameEventIdentifiers.AskForChoosingCardWithConditionsEvent  | 163 | 请求带有限制地选择框内任意数量卡牌           |
| GameEventIdentifiers.AskForChoosingPlayerEvent              | 164 | 请求指定角色                                 |
| GameEventIdentifiers.AskForChoosingOptionsEvent             | 165 | 请求选择选项                                 |
| GameEventIdentifiers.AskForChoosingCharacterEvent           | 166 | 请求选择武将牌                               |
| GameEventIdentifiers.AskForChoosingCardFromPlayerEvent      | 167 | 请求选择一名角色的一张卡牌                   |
| GameEventIdentifiers.AskForSkillUseEvent                    | 168 | 请求发动技能                                 |
| GameEventIdentifiers.AskForPlaceCardsInDileEvent            | 169 | 请求将卡牌以任意顺序置于牌堆顶/底            |
| GameEventIdentifiers.AskForContinuouslyChoosingCardEvent    | 170 | 请求依次选择框内卡牌（不可退回）             |
| GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent | 171 | 请求为卡牌指定合法目标                       |

### type CardResponsiveEventIdentifiers

```ts
export type CardResponsiveEventIdentifiers =
  | GameEventIdentifiers.AskForPeachEvent
  | GameEventIdentifiers.AskForCardResponseEvent
  | GameEventIdentifiers.AskForCardUseEvent;
```

### isCardResponsiveIdentifier

```ts
export const isCardResponsiveIdentifier = (
  identifier: GameEventIdentifiers,
): identifier is CardResponsiveEventIdentifiers => {
  return [
    GameEventIdentifiers.AskForPeachEvent,
    GameEventIdentifiers.AskForCardResponseEvent,
    GameEventIdentifiers.AskForCardUseEvent,
  ].includes(identifier);
};
```

### clientActiveListenerEvents

```ts
export const clientActiveListenerEvents = () => [
  GameEventIdentifiers.SetFlagEvent,
  GameEventIdentifiers.RemoveFlagEvent,
  GameEventIdentifiers.ClearFlagEvent,
  GameEventIdentifiers.AddMarkEvent,
  GameEventIdentifiers.SetMarkEvent,
  GameEventIdentifiers.RemoveMarkEvent,
  GameEventIdentifiers.ClearMarkEvent,
  GameEventIdentifiers.SetOutsideCharactersEvent,
  GameEventIdentifiers.HuaShenCardUpdatedEvent,
  GameEventIdentifiers.UpgradeSideEffectSkillsEvent,

  GameEventIdentifiers.UserMessageEvent,
  GameEventIdentifiers.PhaseChangeEvent,
  GameEventIdentifiers.PhaseStageChangeEvent,
  GameEventIdentifiers.SyncGameCommonRulesEvent,
  GameEventIdentifiers.CustomGameDialog,
  GameEventIdentifiers.NotifyEvent,
  GameEventIdentifiers.PlayerStatusEvent,
  GameEventIdentifiers.PlayerPropertiesChangeEvent,

  GameEventIdentifiers.DrunkEvent,
  GameEventIdentifiers.ChainLockedEvent,

  GameEventIdentifiers.CardResponseEvent,
  GameEventIdentifiers.CardUseEvent,
  GameEventIdentifiers.CardEffectEvent,
  GameEventIdentifiers.CardDisplayEvent,
  GameEventIdentifiers.DrawCardEvent,
  GameEventIdentifiers.MoveCardEvent,
  GameEventIdentifiers.ObserveCardsEvent,

  GameEventIdentifiers.LoseSkillEvent,
  GameEventIdentifiers.ObtainSkillEvent,

  GameEventIdentifiers.AimEvent,

  GameEventIdentifiers.SkillUseEvent,
  GameEventIdentifiers.SkillEffectEvent,
  GameEventIdentifiers.PinDianEvent,
  GameEventIdentifiers.LoseHpEvent,
  GameEventIdentifiers.ChangeMaxHpEvent,
  GameEventIdentifiers.DamageEvent,
  GameEventIdentifiers.RecoverEvent,
  GameEventIdentifiers.JudgeEvent,

  GameEventIdentifiers.GameStartEvent,
  GameEventIdentifiers.GameReadyEvent,
  GameEventIdentifiers.GameOverEvent,
  GameEventIdentifiers.PlayerDyingEvent,
  GameEventIdentifiers.PlayerDiedEvent,
  GameEventIdentifiers.PlayerEnterEvent,
  GameEventIdentifiers.PlayerReenterEvent,
  GameEventIdentifiers.PlayerBulkPacketEvent,
  GameEventIdentifiers.PlayerLeaveEvent,

  GameEventIdentifiers.PlayerChainedEvent,
  GameEventIdentifiers.PlayerTurnOverEvent,

  GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
  GameEventIdentifiers.AskForPeachEvent,
  GameEventIdentifiers.AskForCardResponseEvent,
  GameEventIdentifiers.AskForCardUseEvent,
  GameEventIdentifiers.AskForCardDisplayEvent,
  GameEventIdentifiers.AskForCardDropEvent,
  GameEventIdentifiers.AskForCardEvent,
  GameEventIdentifiers.AskForPinDianCardEvent,
  GameEventIdentifiers.AskForChoosingCardEvent,
  GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
  GameEventIdentifiers.AskForChoosingPlayerEvent,
  GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
  GameEventIdentifiers.AskForChoosingOptionsEvent,
  GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
  GameEventIdentifiers.AskForSkillUseEvent,
  GameEventIdentifiers.AskForChoosingCharacterEvent,
  GameEventIdentifiers.AskForPlaceCardsInDileEvent,
  GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
  GameEventIdentifiers.ObserveCardFinishEvent,
];
```

### serverActiveListenerEvents

```ts
export const serverActiveListenerEvents = [
  GameEventIdentifiers.UserMessageEvent,
  GameEventIdentifiers.PlayerEnterEvent,
  GameEventIdentifiers.PlayerLeaveEvent,
  GameEventIdentifiers.PlayerStatusEvent,
  GameEventIdentifiers.PlayerReenterEvent,
];
```

### serverResponsiveListenerEvents

```ts
export const serverResponsiveListenerEvents = [
  GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
  GameEventIdentifiers.AskForPeachEvent,
  GameEventIdentifiers.AskForCardResponseEvent,
  GameEventIdentifiers.AskForCardUseEvent,
  GameEventIdentifiers.AskForCardDisplayEvent,
  GameEventIdentifiers.AskForCardDropEvent,
  GameEventIdentifiers.AskForCardEvent,
  GameEventIdentifiers.AskForPinDianCardEvent,
  GameEventIdentifiers.AskForChoosingCardEvent,
  GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
  GameEventIdentifiers.AskForChoosingPlayerEvent,
  GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
  GameEventIdentifiers.AskForChoosingOptionsEvent,
  GameEventIdentifiers.AskForChoosingCharacterEvent,
  GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
  GameEventIdentifiers.AskForSkillUseEvent,
  GameEventIdentifiers.AskForPlaceCardsInDileEvent,
  GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
];
```

### const enum CardMovedBySpecifiedReason

| 常量                                    | 值              | 描述 |
| --------------------------------------- | --------------- | ---- |
| CardMovedBySpecifiedReason.JudgeProcess | `'JudgeProcess` |

### const enum CardDrawReason

| 常量                      | 值  | 描述     |
| ------------------------- | --- | -------- |
| CardDrawReason.GameStage  | 0   | 游戏流程 |
| CardDrawReason.KillReward | 1   | 击杀奖励 |
| CardDrawReason.Reforge    | 2   | 重铸     |

### const enum CardMoveReason

| 常量                            | 值  | 描述     |
| ------------------------------- | --- | -------- |
| CardMoveReason.CardDraw         | 0   | 摸牌     |
| CardMoveReason.ActivePrey       | 1   |
| CardMoveReason.ActiveMove       | 2   |
| CardMoveReason.PassiveMove      | 3   |
| CardMoveReason.SelfDrop         | 4   | 主动弃牌 |
| CardMoveReason.PassiveDrop      | 5   | 被动弃牌 |
| CardMoveReason.PlaceToDropStack | 6   |
| CardMoveReason.PlaceToDrawStack | 7   |
| CardMoveReason.CardUse          | 8   | 使用     |
| CardMoveReason.CardResponse     | 9   | 响应     |

### const enum CardMoveArea

| 常量                        | 值  | 描述     |
| --------------------------- | --- | -------- |
| CardMoveArea.HandArea       | 0   | 手牌区   |
| CardMoveArea.EquipArea      | 1   | 装备区   |
| CardMoveArea.JudgeArea      | 2   | 判定区   |
| CardMoveArea.OutsideArea    | 3   | 额外区域 |
| CardMoveArea.DropStack      | 4   | 弃牌堆   |
| CardMoveArea.DrawStack      | 5   | 摸牌堆   |
| CardMoveArea.ProcessingArea | 6   | 处理区   |

### const enum WorkPlace

| 常量             | 值  | 描述   |
| ---------------- | --- | ------ |
| WorkPlace.Client | 0   | 客户端 |
| WorkPlace.Server | 1   | 服务端 |

### type BaseGameEvent

```ts
export type BaseGameEvent = {
  unengagedMessage?: PatchedTranslationObject;
  engagedPlayerIds?: PlayerId[];
  triggeredBySkills?: string[];
  messages?: string[];
  translationsMessage?: PatchedTranslationObject;
  ignoreNotifiedStatus?: boolean;
  animation?: {
    from: PlayerId;
    tos: PlayerId[];
  }[];
};
```

### type ClientBaseEvent

```ts
export type ClientBaseEvent = {
  status?: 'online' | 'offline' | 'quit' | 'trusted' | 'player';
};
```

### type EventProcessSteps

```ts
export type EventProcessSteps = { from: PlayerId; tos: PlayerId[] }[];
```

### type EventUtilities

```ts
export type EventUtilities = {
  [K in keyof typeof GameEventIdentifiers]: object;
};
```

### type EventPicker

```ts
export type EventPicker<I extends GameEventIdentifiers, E extends WorkPlace> = BaseGameEvent &
  (E extends WorkPlace.Client ? ClientEvent[I] : ServerEvent[I]);
```

### interface ServerEvent

### interface ClientEvent

### type ClientEventFinder

```ts
export type ClientEventFinder<I extends GameEventIdentifiers> = BaseGameEvent & ClientBaseEvent & ClientEvent[I];
```

### type ServerEventFinder

```ts
export type ServerEventFinder<I extends GameEventIdentifiers> = BaseGameEvent & ServerEvent[I];
```
