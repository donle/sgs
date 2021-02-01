# Judge Matcher

> [DSanguosha](../../index.md) > [Core](../core-index.md) > [Shared](./shared-index.md) > Algorithm

___

JudgeMatcher类用来提供与判定相关的辅助。

[查看源文件...](../../../src/core/shares/libs/judge_matchers.ts)

- [Judge Matcher](#judge-matcher)
  - [Member Function Documentation](#member-function-documentation)
    - [onJudge](#onjudge)
  - [Related Non-members](#related-non-members)
    - [const enum JudgeMatcherEnum](#const-enum-judgematcherenum)

___

## Member Function Documentation

### onJudge

原型：`onJudge(matcherEnum: JudgeMatcherEnum, card: Card)`

功能：根据传入的matcherEnum和card判断对应的判定是否生效。

___

## Related Non-members

### const enum JudgeMatcherEnum

| 常量                              | 值  | 描述                                                        |
| --------------------------------- | --- | ----------------------------------------------------------- |
| JudgeMatcherEnum.LeBuSiShu        | 1   | 卡牌[【乐不思蜀】](#judge-matcher)相关判定                  |
| JudgeMatcherEnum.BingLiangCunDuan | 2   | 卡牌[【兵粮寸断】](#judge-matcher)相关判定                  |
| JudgeMatcherEnum.BaGuaZhen        | 3   | 卡牌[【八卦阵】](#judge-matcher)相关判定                    |
| JudgeMatcherEnum.Lightning        | 4   | 卡牌[【闪电】](#judge-matcher)相关判定                      |
| JudgeMatcherEnum.BaoNve           | 5   | 武将技能[【暴虐】](../../characters/forest.md#暴虐)相关判定 |
| JudgeMatcherEnum.WuHun            | 6   | 武将技能[【武魂】](../../characters/forest.md#武魂)相关判定 |
| JudgeMatcherEnum.LuoShen          | 7   | 武将技能[【洛神】](../../characters/forest.md#洛神)相关判定 |
| JudgeMatcherEnum.SiShu            | 8   | 武将技能[【思蜀】](../../characters/forest.md#思蜀)相关判定 |
| JudgeMatcherEnum.TunTian          | 9   | 武将技能[【屯田】](../../characters/forest.md#屯田)相关判定 |
