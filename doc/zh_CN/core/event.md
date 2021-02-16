# EventPacker Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > Event

___

## Static Public Members

### wrapGameRunningInfo
### getGameRunningInfo
### minifyPayload
### setTimestamp
### getTimestamp
### isDisresponsiveEvent
### setDisresponsiveEvent
### addMiddleware
### getMiddleware
### removeMiddleware
### createUncancellableEvent
### createIdentifierEvent
### hasIdentifier
### getIdentifier
### isUncancellabelEvent
### terminate
### recall
### isTerminated
### copyPropertiesTo
### setDamageSignatureInCardUse
### getDamageSignatureInCardUse

___

## Related Non-members

### const enum GameEventIdentifiers

游戏中的所有事件。

| 常量                                                        | 值  | 描述 |
| ----------------------------------------------------------- | --- | ---- |
| GameEventIdentifiers.UserMessageEvent                       | 100 |通知各客户端任一玩家的发言|
| GameEventIdentifiers.PlayerStatusEvent                      | 101 |通知各客户端显示玩家当前游戏状态（如：离线）|
| GameEventIdentifiers.NotifyEvent                            | 102 |请求响应操作事件|
| GameEventIdentifiers.CustomGameDialog                       | 103 |通知各客户端显示自定log消息|
| GameEventIdentifiers.PhaseChangeEvent                       | 104 |阶段变化事件|
| GameEventIdentifiers.PhaseStageChangeEvent                  | 105 |阶段内时机点切换事件|
| GameEventIdentifiers.SyncGameCommonRulesEvent               | 106 |游戏规则变动事件|
| GameEventIdentifiers.PlayerPropertiesChangeEvent            | 107 |角色属性变更事件|
| GameEventIdentifiers.SetOutsideCharactersEvent              | 108 |通知各客户端显示被除外卡牌|
| GameEventIdentifiers.HuaShenCardUpdatedEvent                | 109 |通知各客户端当前化身武将及技能|
| GameEventIdentifiers.UpgradeSideEffectSkillsEvent           | 110 |通知客户端装载附属技能（如：制霸）|
| GameEventIdentifiers.SetFlagEvent                           | 111 |通知客户端设置flag|
| GameEventIdentifiers.RemoveFlagEvent                        | 112 |通知客户端移除flag|
| GameEventIdentifiers.ClearFlagEvent                         | 113 |通知客户端清除flag|
| GameEventIdentifiers.AddMarkEvent                           | 114 |通知客户端添加标记|
| GameEventIdentifiers.SetMarkEvent                           | 115 |通知客户端设置标记|
| GameEventIdentifiers.RemoveMarkEvent                        | 116 |通知客户端移除标记|
| GameEventIdentifiers.ClearMarkEvent                         | 117 |通知客户端清除标记|
| GameEventIdentifiers.DrunkEvent                             | 118 |通知显示/清除使用【酒】后的脸红效果|
| GameEventIdentifiers.ChainLockedEvent                       | 119 |角色横置/重置事件|
| GameEventIdentifiers.LoseSkillEvent                         | 120 |失去技能事件|
| GameEventIdentifiers.ObtainSkillEvent                       | 121 |获得技能事件|
| GameEventIdentifiers.ReforgeEvent                           | 122 |重铸事件|
| GameEventIdentifiers.CardResponseEvent                      | 123 |卡牌响应事件|
| GameEventIdentifiers.CardUseEvent                           | 124 |卡牌使用事件|
| GameEventIdentifiers.CardEffectEvent                        | 125 |卡牌生效事件|
| GameEventIdentifiers.CardDisplayEvent                       | 126 |展示卡牌事件|
| GameEventIdentifiers.DrawCardEvent                          | 127 |摸牌事件|
| GameEventIdentifiers.MoveCardEvent                          | 128 |移动卡牌事件|
| GameEventIdentifiers.ObserveCardsEvent                      | 129 |请求执行明牌选择操作|
| GameEventIdentifiers.ObserveCardFinishEvent                 | 130 |停止明牌选择操作|
| GameEventIdentifiers.AimEvent                               | 131 |指定/成为目标事件|
| GameEventIdentifiers.SkillUseEvent                          | 132 |技能发动事件|
| GameEventIdentifiers.SkillEffectEvent                       | 133 |技能生效事件|
| GameEventIdentifiers.PinDianEvent                           | 134 |拼点事件|
| GameEventIdentifiers.LoseHpEvent                            | 135 |失去体力事件|
| GameEventIdentifiers.ChangeMaxHpEvent                       | 136 |体力上限变更事件|
| GameEventIdentifiers.DamageEvent                            | 137 |伤害事件|
| GameEventIdentifiers.RecoverEvent                           | 138 |回复事件|
| GameEventIdentifiers.HpChangeEvent                          | 139 |体力变更事件|
| GameEventIdentifiers.JudgeEvent                             | 140 |判定事件|
| GameEventIdentifiers.GameReadyEvent                         | 141 |游戏准备时|
| GameEventIdentifiers.GameStartEvent                         | 142 |游戏开始时|
| GameEventIdentifiers.GameOverEvent                          | 143 |游戏结束时|
| GameEventIdentifiers.PlayerEnterRefusedEvent                | 144 |拒绝玩家进入房间事件|
| GameEventIdentifiers.PlayerReenterEvent                     | 145 |断线重连事件|
| GameEventIdentifiers.PlayerBulkPacketEvent                  | 146 ||
| GameEventIdentifiers.PlayerEnterEvent                       | 147 |玩家进入事件|
| GameEventIdentifiers.PlayerLeaveEvent                       | 148 |玩家离开事件|
| GameEventIdentifiers.PlayerDyingEvent                       | 149 |角色濒死事件|
| GameEventIdentifiers.PlayerDiedEvent                        | 150 |角色死亡事件|
| GameEventIdentifiers.PhaseSkippedEvent                      | 151 |阶段跳过后|
| GameEventIdentifiers.PlayerChainedEvent                     | 152 |（未知）|
| GameEventIdentifiers.PlayerTurnOverEvent                    | 153 |角色翻面事件|
| GameEventIdentifiers.AskForPlayCardsOrSkillsEvent           | 154 |出牌阶段空闲时间点请求使用卡牌或技能|
| GameEventIdentifiers.AskForPeachEvent                       | 155 |濒死求桃事件|
| GameEventIdentifiers.AskForCardResponseEvent                | 156 |请求打出卡牌|
| GameEventIdentifiers.AskForCardUseEvent                     | 157 |请求使用卡牌|
| GameEventIdentifiers.AskForCardDisplayEvent                 | 158 |请求选择自身卡牌展示|
| GameEventIdentifiers.AskForCardDropEvent                    | 159 |请求弃置自身卡牌|
| GameEventIdentifiers.AskForCardEvent                        | 160 |请求选择自身卡牌|
| GameEventIdentifiers.AskForPinDianCardEvent                 | 161 |请求选择手牌用于拼点|
| GameEventIdentifiers.AskForChoosingCardEvent                | 162 |请求选择框内任意数量卡牌|
| GameEventIdentifiers.AskForChoosingCardWithConditionsEvent  | 163 |请求带有限制地选择框内任意数量卡牌|
| GameEventIdentifiers.AskForChoosingPlayerEvent              | 164 |请求指定角色|
| GameEventIdentifiers.AskForChoosingOptionsEvent             | 165 |请求选择选项|
| GameEventIdentifiers.AskForChoosingCharacterEvent           | 166 |请求选择武将牌|
| GameEventIdentifiers.AskForChoosingCardFromPlayerEvent      | 167 |请求选择一名角色的一张卡牌|
| GameEventIdentifiers.AskForSkillUseEvent                    | 168 |请求发动技能|
| GameEventIdentifiers.AskForPlaceCardsInDileEvent            | 169 |请求将卡牌以任意顺序置于牌堆顶/底|
| GameEventIdentifiers.AskForContinuouslyChoosingCardEvent    | 170 |请求依次选择框内卡牌（不可退回）|
| GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent | 171 |请求为卡牌指定合法目标|
