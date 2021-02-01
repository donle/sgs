# System

> [DSanguosha](../index.md) > [Core](./core_index.md) > [Shared](./shared_index.md) > System

___

system是一个命名空间，包含有和askForChooseCard以及SideEffectSkill相关的部分。

[查看源文件...](../../src/core/shares/libs/system.ts)

- [System](#system)
  - [AskForChoosingCardEventFilter相关](#askforchoosingcardeventfilter相关)
    - [const enum AskForChoosingCardEventFilter](#const-enum-askforchoosingcardeventfilter)
    - [type AskForChoosingCardEventFilterFunc](#type-askforchoosingcardeventfilterfunc)
    - [AskForChoosingCardEventFilters](#askforchoosingcardeventfilters)
  - [SideEffectSkill相关](#sideeffectskill相关)
    - [type SideEffectSkillApplierFunc](#type-sideeffectskillapplierfunc)
    - [const enum SideEffectSkillApplierEnum](#const-enum-sideeffectskillapplierenum)
    - [const SideEffectSkillAppliers](#const-sideeffectskillappliers)

___

## AskForChoosingCardEventFilter相关

### const enum AskForChoosingCardEventFilter

| 常量                                 | 值  | 描述                                                       |
| ------------------------------------ | --- | ---------------------------------------------------------- |
| AskForChoosingCardEventFilter.SheLie | 0   | 与技能[【涉猎】](../characters/god.md#涉猎)有关         |
| AskForChoosingCardEventFilter.PoXi   | 1   | 与技能[【魄袭】](../characters/god.md#魄袭)有关         |
| AskForChoosingCardEventFilter.JieYue | 2   | 与技能[【节钺】](../characters/yijiang2011.md#节钺)有关 |

### type AskForChoosingCardEventFilterFunc

该类型表示一种函数，其专用于与AskForChoosingCardEventFilter中的枚举值相对应。具体运用请查看源文件。

### AskForChoosingCardEventFilters

该对象由一组\[AskForChoosingCardEventFilter->AskForChoosingCardEventFilterFunc\]键值对组成。

用于根据不同的枚举值返回相应的函数。

【魄袭】和【涉猎】被对应于differentCardSuitFilterFunction，【节钺】被对应于differentCardAreaFilterFunction。

___

## SideEffectSkill相关

### type SideEffectSkillApplierFunc

该类型表示一种函数，其专用于与AskForChoosingCardEventFilter中的枚举值相对应。具体运用请查看源文件。

### const enum SideEffectSkillApplierEnum

| 常量                                 | 值  | 描述                                                    |
| ------------------------------------ | --- | ------------------------------------------------------- |
| SideEffectSkillApplierEnum.ZhiBa     | 0   | 与技能[【制霸】](../characters/mountain.md#制霸)有关 |
| SideEffectSkillApplierEnum.HuangTian | 1   | 与技能[【黄天】](../characters/wind.md#黄天)有关     |

### const SideEffectSkillAppliers

该对象由一组\[AskForChoosingCardEventFilter->AskForChoosingCardEventFilterFunc\]键值对组成。

用于根据不同的枚举值返回相应的函数。

___

参看[SideEffectSkill](./system.md)以及涉及的相关技能。
