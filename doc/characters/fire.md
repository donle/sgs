# 火

> [DSanguosha](../index.md) > [武将一览](./characters-index.md) > 火

___

- [火](#火)
  - [典韦 魏 4/4](#典韦-魏-44)
    - [强袭](#强袭)
  - [荀彧 魏 3/3](#荀彧-魏-33)
    - [驱虎](#驱虎)
    - [节命](#节命)
  - [卧龙诸葛亮 蜀 3/3](#卧龙诸葛亮-蜀-33)
    - [八阵](#八阵)
    - [火计](#火计)
    - [看破](#看破)
    - [藏拙](#藏拙)
  - [庞统 蜀 3/3](#庞统-蜀-33)
    - [连环](#连环)
    - [涅槃](#涅槃)
  - [太史慈 吴 4/4](#太史慈-吴-44)
    - [天义](#天义)
    - [酣战](#酣战)
  - [袁绍 群 4/4](#袁绍-群-44)
    - [乱击](#乱击)
    - [血裔](#血裔)
  - [庞德 群 4/4](#庞德-群-44)
    - [马术](#马术)
    - [鞬出](#鞬出)
  - [颜良文丑 群 4/4](#颜良文丑-群-44)
    - [双雄](#双雄)

___

## 典韦 魏 4/4

[查看源代码...](../../src/core/characters/fire/dianwei.ts)

### 强袭

[查看源代码...](../../src/core/skills/characters/fire/qiangxi.ts)

出牌阶段限两次，你可以失去1点体力或弃置一张武器牌，并对本回合内你未以此法指定过的一名其他角色造成1点伤害。

___

## 荀彧 魏 3/3

[查看源代码...](../../src/core/characters/fire/xunyu.ts)

### 驱虎

[查看源代码...](../../src/core/skills/characters/fire/quhu.ts)

出牌阶段限一次，你可以与体力值大于你的一名角色拼点，若你：赢，你令该角色对其攻击范围内由你选择的一名角色造成1点伤害；没赢，其对你造成1点伤害。

### 节命

[查看源代码...](../../src/core/skills/characters/fire/jieming.ts)

当你受到1点伤害后，你可以令一名角色摸两张牌，然后若其手牌数不大于其体力上限，你摸一张牌。

___

## 卧龙诸葛亮 蜀 3/3

[查看源代码...](../../src/core/characters/fire/wolong.ts)

### 八阵

[查看源代码...](../../src/core/skills/characters/fire/bazhen.ts)

<b>锁定技</b>，若你的装备区里没有防具牌，则视为你装备【八卦阵】。

### 火计

[查看源代码...](../../src/core/skills/characters/fire/huoji.ts)

你可以将一张红色牌当【火攻】使用。

### 看破

[查看源代码...](../../src/core/skills/characters/fire/kanpo.ts)

你可以将一张黑色牌当【无懈可击】使用。

### 藏拙

[查看源代码...](../../src/core/skills/characters/fire/cangzhuo.ts)

<b>锁定技</b>，弃牌阶段开始时，若你本回合未使用过锦囊牌，则你的锦囊牌于本回合内不计入手牌上限。

___

## 庞统 蜀 3/3

[查看源代码...](../../src/core/characters/fire/pangtong.ts)

### 连环

[查看源代码...](../../src/core/skills/characters/fire/lianhuan.ts)

你可以将一张梅花手牌当【铁索连环】使用或重铸；你使用【铁索连环】的目标上限+1。

### 涅槃

[查看源代码...](../../src/core/skills/characters/fire/niepan.ts)

<b>限定技</b>，当你处于濒死状态时，你可以弃置你区域里的所有牌，然后复原你的武将牌，摸三张牌并将体力回复至3点。然后你从“八阵”、“火计”、“看破”中选择一个获得。

___

## 太史慈 吴 4/4

[查看源代码...](../../src/core/characters/fire/taishici.ts)

### 天义

[查看源代码...](../../src/core/skills/characters/fire/tianyi.ts)

出牌阶段限一次，你可以与一名角色拼点，若你：赢，直到回合结束，你使用【杀】无距离限制且次数上限和目标上限+1；没赢，本回合你不能使用【杀】。

### 酣战

[查看源代码...](../../src/core/skills/characters/fire/hanzhan.ts)

你与角色拼点，或其他角色对你发起拼点时，你可令其使用随机手牌拼点。当你拼点后，你可获得拼点牌中点数最大的【杀】。

___

## 袁绍 群 4/4

[查看源代码...](../../src/core/characters/fire/yuanshao.ts)

### 乱击

[查看源代码...](../../src/core/skills/characters/fire/luanji.ts)

你可以将两张花色相同的手牌当【万箭齐发】使用；你使用【万箭齐发】可以少选一个目标。

### 血裔

[查看源代码...](../../src/core/skills/characters/fire/xueyi.ts)

<b>主公技</b>，游戏开始时，你获得X枚“裔”标记（X为群势力角色数）；回合开始时，你可以移除一枚"裔"并摸一张牌；你每有一枚"裔"，手牌上限便+2。

___

## 庞德 群 4/4

[查看源代码...](../../src/core/characters/fire/pangde.ts)

### 马术

[查看源代码...](../../src/core/skills/characters/fire/mashu.ts)

<b>锁定技</b>，你计算与其他角色的距离-1。

### 鞬出

[查看源代码...](../../src/core/skills/characters/fire/jianchu.ts)

当你使用【杀】指定一名角色为目标后，你可以弃置其一张牌，若你以此法弃置的牌：不为基本牌，此【杀】不可被【闪】响应，且你本回合内使用【杀】的次数上限+1；为基本牌，该角色获得此【杀】。

___

## 颜良文丑 群 4/4

[查看源代码...](../../src/core/characters/fire/yanliangwenchou.ts)

### 双雄

[查看源代码...](../../src/core/skills/characters/fire/shuangxiong.ts)

摸牌阶段，你可以改为亮出牌堆顶两张牌，并获得其中一张牌，然后本回合内你可以将与此牌颜色不同的一张手牌当【决斗】使用；当你因“双雄”而受到伤害后，你可以获得本次【决斗】中其他角色打出的【杀】。

