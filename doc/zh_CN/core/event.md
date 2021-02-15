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
| GameEventIdentifiers.UserMessageEvent                       | 100 |
| GameEventIdentifiers.PlayerStatusEvent                      | 101 |
| GameEventIdentifiers.NotifyEvent                            | 102 |
| GameEventIdentifiers.CustomGameDialog                       | 103 |
| GameEventIdentifiers.PhaseChangeEvent                       | 104 |
| GameEventIdentifiers.PhaseStageChangeEvent                  | 105 |
| GameEventIdentifiers.SyncGameCommonRulesEvent               | 106 |
| GameEventIdentifiers.PlayerPropertiesChangeEvent            | 107 |
| GameEventIdentifiers.SetOutsideCharactersEvent              | 108 |
| GameEventIdentifiers.HuaShenCardUpdatedEvent                | 109 |
| GameEventIdentifiers.UpgradeSideEffectSkillsEvent           | 110 |
| GameEventIdentifiers.SetFlagEvent                           | 111 |
| GameEventIdentifiers.RemoveFlagEvent                        | 112 |
| GameEventIdentifiers.ClearFlagEvent                         | 113 |
| GameEventIdentifiers.AddMarkEvent                           | 114 |
| GameEventIdentifiers.SetMarkEvent                           | 115 |
| GameEventIdentifiers.RemoveMarkEvent                        | 116 |
| GameEventIdentifiers.ClearMarkEvent                         | 117 |
| GameEventIdentifiers.DrunkEvent                             | 118 |
| GameEventIdentifiers.ChainLockedEvent                       | 119 |
| GameEventIdentifiers.LoseSkillEvent                         | 120 |
| GameEventIdentifiers.ObtainSkillEvent                       | 121 |
| GameEventIdentifiers.ReforgeEvent                           | 122 |
| GameEventIdentifiers.CardResponseEvent                      | 123 |
| GameEventIdentifiers.CardUseEvent                           | 124 |
| GameEventIdentifiers.CardEffectEvent                        | 125 |
| GameEventIdentifiers.CardDisplayEvent                       | 126 |
| GameEventIdentifiers.DrawCardEvent                          | 127 |
| GameEventIdentifiers.MoveCardEvent                          | 128 |
| GameEventIdentifiers.ObserveCardsEvent                      | 129 |
| GameEventIdentifiers.ObserveCardFinishEvent                 | 130 |
| GameEventIdentifiers.AimEvent                               | 131 |
| GameEventIdentifiers.SkillUseEvent                          | 132 |
| GameEventIdentifiers.SkillEffectEvent                       | 133 |
| GameEventIdentifiers.PinDianEvent                           | 134 |
| GameEventIdentifiers.LoseHpEvent                            | 135 |
| GameEventIdentifiers.ChangeMaxHpEvent                       | 136 |
| GameEventIdentifiers.DamageEvent                            | 137 |
| GameEventIdentifiers.RecoverEvent                           | 138 |
| GameEventIdentifiers.HpChangeEvent                          | 139 |
| GameEventIdentifiers.JudgeEvent                             | 140 |
| GameEventIdentifiers.GameReadyEvent                         | 141 |
| GameEventIdentifiers.GameStartEvent                         | 142 |
| GameEventIdentifiers.GameOverEvent                          | 143 |
| GameEventIdentifiers.PlayerEnterRefusedEvent                | 144 |
| GameEventIdentifiers.PlayerReenterEvent                     | 145 |
| GameEventIdentifiers.PlayerBulkPacketEvent                  | 146 |
| GameEventIdentifiers.PlayerEnterEvent                       | 147 |
| GameEventIdentifiers.PlayerLeaveEvent                       | 148 |
| GameEventIdentifiers.PlayerDyingEvent                       | 149 |
| GameEventIdentifiers.PlayerDiedEvent                        | 150 |
| GameEventIdentifiers.PhaseSkippedEvent                      | 151 |
| GameEventIdentifiers.PlayerChainedEvent                     | 152 |
| GameEventIdentifiers.PlayerTurnOverEvent                    | 153 |
| GameEventIdentifiers.AskForPlayCardsOrSkillsEvent           | 154 |
| GameEventIdentifiers.AskForPeachEvent                       | 155 |
| GameEventIdentifiers.AskForCardResponseEvent                | 156 |
| GameEventIdentifiers.AskForCardUseEvent                     | 157 |
| GameEventIdentifiers.AskForCardDisplayEvent                 | 158 |
| GameEventIdentifiers.AskForCardDropEvent                    | 159 |
| GameEventIdentifiers.AskForCardEvent                        | 160 |
| GameEventIdentifiers.AskForPinDianCardEvent                 | 161 |
| GameEventIdentifiers.AskForChoosingCardEvent                | 162 |
| GameEventIdentifiers.AskForChoosingCardWithConditionsEvent  | 163 |
| GameEventIdentifiers.AskForChoosingPlayerEvent              | 164 |
| GameEventIdentifiers.AskForChoosingOptionsEvent             | 165 |
| GameEventIdentifiers.AskForChoosingCharacterEvent           | 166 |
| GameEventIdentifiers.AskForChoosingCardFromPlayerEvent      | 167 |
| GameEventIdentifiers.AskForSkillUseEvent                    | 168 |
| GameEventIdentifiers.AskForPlaceCardsInDileEvent            | 169 |
| GameEventIdentifiers.AskForContinuouslyChoosingCardEvent    | 170 |
| GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent | 171 |
