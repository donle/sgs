# Player Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > Player

___

Player类表示游戏中的玩家。

[查看源代码...](../../../src/core/player/player.ts)

- [Player Class](#player-class)
  - [Properties Documentation](#properties-documentation)
    - [Hp: number](#hp-number)
    - [Gender: CharacterGender](#gender-charactergender)
    - [ChainLocked: boolean](#chainlocked-boolean)
    - [Nationality: CharacterNationality](#nationality-characternationality)
    - [MaxHp: number](#maxhp-number)
    - [LostHp: number](#losthp-number)
    - [Role: PlayerRole](#role-playerrole)
    - [CharacterId: CharacterId | undefined](#characterid-characterid--undefined)
    - [Character: Character](#character-character)
    - [Id: PlayerId](#id-playerid)
    - [Name: string](#name-string)
    - [Position: number](#position-number)
    - [CardUseHistory: CardId[]](#cardusehistory-cardid)
    - [Dead: boolean](#dead-boolean)
    - [Dying: boolean](#dying-boolean)
    - [AI: PlayerAI](#ai-playerai)
  - [Public Functions](#public-functions)
    - [constructor](#constructor)
    - [clearFlags() => void](#clearflags--void)
    - [removeFlag(name: string) => void](#removeflagname-string--void)
    - [setFlag\<T>(name: string, value: T) => T](#setflagtname-string-value-t--t)
    - [getFlag\<T>(name: string) => T](#getflagtname-string--t)
    - [getAllFlags() => { \[k: string\]: any;}](#getallflags---k-string-any)
    - [clearMarks() => void](#clearmarks--void)
    - [removeMark(name: string) => void](#removemarkname-string--void)
    - [setMark(name: string, value: number) => number](#setmarkname-string-value-number--number)
    - [addMark(name: string, value: number) => number](#addmarkname-string-value-number--number)
    - [getMark(name: string) => number](#getmarkname-string--number)
    - [getAllMarks() => { \[markName: string\]: number;}](#getallmarks---markname-string-number)
    - [addInvisibleMark(name: string, value: number) => number](#addinvisiblemarkname-string-value-number--number)
    - [getInvisibleMark(name: string) => number](#getinvisiblemarkname-string--number)
    - [removeInvisibleMark(name: string) => void](#removeinvisiblemarkname-string--void)
    - [canUseCard(room: Room, cardId: CardId | [CardMatcher](./card_matcher.md), onResponse?: [CardMatcher](./card_matcher.md)) => boolean](#canusecardroom-room-cardid-cardid--cardmatcher-onresponse-cardmatcher--boolean)
    - [resetCardUseHistory(cardName?: string) => void](#resetcardusehistorycardname-string--void)
    - [resetSkillUseHistory(skillName: string) => void](#resetskillusehistoryskillname-string--void)
    - [useCard(cardId: CardId) => void](#usecardcardid-cardid--void)
    - [useSkill(skillName: string) => void](#useskillskillname-string--void)
    - [getCardIds\<T extends CardId | [CharacterId](./character.md#type-characterid) = [CardId](./card.md#type-cardid)>(area?: [PlayerCardsArea](#const-enum-playercardsarea), outsideAreaName?: string) => T\[\]](#getcardidst-extends-cardid--characterid--cardidarea-playercardsarea-outsideareaname-string--t)
    - [setCharacterOutsideAreaCards(areaName: string, characterIds: CharacterId[]) => void](#setcharacteroutsideareacardsareaname-string-characterids-characterid--void)
    - [isCharacterOutsideArea(areaName: string) => boolean](#ischaracteroutsideareaareaname-string--boolean)
    - [getOutsideAreaNameOf\<T extends CardId | [CharacterId](./character.md#type-characterid)>(cardId: T) => string | undefined](#getoutsideareanameoft-extends-cardid--characteridcardid-t--string--undefined)
    - [getOutsideAreaCards() => PlayerCardsOutside](#getoutsideareacards--playercardsoutside)
    - [getPlayerCards() => CardId[]](#getplayercards--cardid)
    - [getWeaponCardId() => CardId | undefined](#getweaponcardid--cardid--undefined)
    - [getCardId(cardId: CardId) => [CardId](./card.md#type-cardid) | undefined](#getcardidcardid-cardid--cardid--undefined)
    - [cardFrom(cardId: CardId) => [PlayerCardsArea](#const-enum-playercardsarea) | undefined](#cardfromcardid-cardid--playercardsarea--undefined)
    - [obtainCardIds(...cards: CardId[]) => void](#obtaincardidscards-cardid--void)
    - [dropCards(...cards: CardId[]) => [CardId](./card.md#type-cardid)[]](#dropcardscards-cardid--cardid)
    - [equip(equipCard: EquipCard) => CardId](#equipequipcard-equipcard--cardid)
    - [isInjured() => boolean](#isinjured--boolean)
    - [getDrunk() => void](#getdrunk--void)
    - [hasDrunk() => number](#hasdrunk--number)
    - [clearHeaded() => void](#clearheaded--void)
    - [canUseCardTo(room: Room, cardId: CardId | [CardMatcher](./card_matcher.md), target: PlayerId) => boolean](#canusecardtoroom-room-cardid-cardid--cardmatcher-target-playerid--boolean)
    - [getEquipment(cardType: CardType) => string | number | undefined](#getequipmentcardtype-cardtype--string--number--undefined)
    - [hasCard(room: Room, cardMatcherOrId: CardId | [CardMatcher](./card_matcher.md), areas?: [PlayerCardsArea](#const-enum-playercardsarea), outsideName?: string) => boolean](#hascardroom-room-cardmatcherorid-cardid--cardmatcher-areas-playercardsarea-outsidename-string--boolean)
    - [hasUsed(cardName: string) => boolean](#hasusedcardname-string--boolean)
    - [cardUsedTimes(cardSkillName: CardId | [CardMatcher](./card_matcher.md)) => number](#cardusedtimescardskillname-cardid--cardmatcher--number)
    - [hasUsedSkill(skillName: string) => boolean](#hasusedskillskillname-string--boolean)
    - [hasUsedSkillTimes(skillName: string) => number](#hasusedskilltimesskillname-string--number)
    - [getAttackDistance(room: Room) => number](#getattackdistanceroom-room--number)
    - [getAttackRange(room: Room) => number](#getattackrangeroom-room--number)
    - [getMaxCardHold(room: Room) => number](#getmaxcardholdroom-room--number)
    - [getOffenseDistance(room: Room) => number](#getoffensedistanceroom-room--number)
    - [getDefenseDistance(room: Room) => number](#getdefensedistanceroom-room--number)
    - [getCardUsableDistance(room: Room, cardId?: CardId, target?: [Player](#player-class)) => number](#getcardusabledistanceroom-room-cardid-cardid-target-player--number)
    - [getCardAdditionalUsableNumberOfTargets(room: Room, cardId: CardId | [CardMatcher](./card_matcher.md)) => number](#getcardadditionalusablenumberoftargetsroom-room-cardid-cardid--cardmatcher--number)
    - [getEquipSkills\<T extends Skill = Skill>(skillType?: SkillStringType) => T[]](#getequipskillst-extends-skill--skillskilltype-skillstringtype--t)
    - [getPlayerSkills\<T extends Skill = Skill>(skillType?: SkillStringType, includeDisabled?: boolean) => T[]](#getplayerskillst-extends-skill--skillskilltype-skillstringtype-includedisabled-boolean--t)
    - [getSkills\<T extends Skill = Skill>(skillType?: SkillStringType) => T[]](#getskillst-extends-skill--skillskilltype-skillstringtype--t)
    - [loseSkill(skillName: string | string[]) => Skill[]](#loseskillskillname-string--string--skill)
    - [obtainSkill(skillName: string) => void](#obtainskillskillname-string--void)
    - [addSkill(skill: Skill) => void](#addskillskill-skill--void)
    - [removeSkill(skill: Skill) => void](#removeskillskill-skill--void)
    - [hasSkill(skillName: string) => boolean](#hasskillskillname-string--boolean)
    - [hasShadowSkill(skillName: string) => boolean](#hasshadowskillskillname-string--boolean)
    - [turnOver() => void](#turnover--void)
    - [isFaceUp() => boolean](#isfaceup--boolean)
    - [changeHp(amount: number) => void](#changehpamount-number--void)
    - [bury() => void](#bury--void)
    - [getPlayerInfo() => PlayerInfo](#getplayerinfo--playerinfo)
    - [setHuaShenInfo(info: HuaShenInfo) => void](#sethuasheninfoinfo-huasheninfo--void)
    - [getHuaShenInfo() => HuashenInfo | undefined](#gethuasheninfo--huasheninfo--undefined)
    - [setOffline(quit?: boolean) => void](#setofflinequit-boolean--void)
    - [setOnline() => void](#setonline--void)
    - [isOnline() => boolean](#isonline--boolean)
    - [delegateOnTrusted(trusted: boolean) => void](#delegateontrustedtrusted-boolean--void)
    - [isTrusted() => boolean](#istrusted--boolean)
    - [getPlayerStatus() => PlayerStatus](#getplayerstatus--playerstatus)
  - [Related Non-members](#related-non-members)
    - [type PlayerId](#type-playerid)
    - [type PlayerCardsOutside](#type-playercardsoutside)
    - [type PlayerCards](#type-playercards)
    - [const enum PlayerRole](#const-enum-playerrole)
    - [const enum PlayerCardsArea](#const-enum-playercardsarea)
    - [const enum PlayerStatus](#const-enum-playerstatus)
    - [interface PlayerInfo](#interface-playerinfo)
    - [const enum DistanceType](#const-enum-distancetype)
    - [type SkillStringType](#type-skillstringtype)
    - [type HuaShenInfo](#type-huasheninfo)

## Properties Documentation

### Hp: number

角色当前生命值。

### Gender: [CharacterGender](./character.md#const-enum-charactergender)

角色的性别。

### ChainLocked: boolean

角色是否处于连环状态。

### Nationality: [CharacterNationality](./character.md#const-enum-characternationality)

角色的势力。

### MaxHp: number

角色的体力上限。

### LostHp: number

角色已损失的体力。

### Role: [PlayerRole](#const-enum-playerrole)

角色的身份。

### CharacterId: [CharacterId](./character.md#type-characterid) | undefined

角色的武将的编号。

### Character: [Character](./character.md)

角色当前使用的武将。

### Id: [PlayerId](#type-playerid)

角色的id。

### Name: string

角色的名字（网名）。

### Position: number

角色的座位号。

### CardUseHistory: [CardId](./card.md#type-cardid)[]

角色本回合的卡牌使用历史。

### Dead: boolean

角色是否已死亡。

### Dying: boolean

角色是否处于濒死状态。

### AI: PlayerAI

___

## Public Functions

### constructor

```typescript
constructor(
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
    protected playerCharacterId?: CharacterId,
  ) => Player;
```

构造函数。

### clearFlags() => void

清空该角色的flags。

### removeFlag(name: string) => void

删除该角色的名为name的flag。

### setFlag\<T>(name: string, value: T) => T

给该角色设置一个名为name，值为任意的flag。

### getFlag\<T>(name: string) => T

获取该角色名为name的flag的值。

### getAllFlags() => { \[k: string\]: any;}

获取该角色所有flag。

### clearMarks() => void

清空该角色所有mark。

### removeMark(name: string) => void

清空该角色的名为name的mark。

### setMark(name: string, value: number) => number

将该角色名为name的mark设定为某一数值，并返回该数值。

### addMark(name: string, value: number) => number

将该角色名为name的mark数量增加某一数值，并返回该mark的数量。

### getMark(name: string) => number

获取该角色的名为name的mark数量。

### getAllMarks() => { \[markName: string\]: number;}

获取该角色所有的mark。

### addInvisibleMark(name: string, value: number) => number

将该角色名为name的隐藏mark数量增加某一数值，并返回该mark的数量。

### getInvisibleMark(name: string) => number

获取该角色的名为name的隐藏mark数量。

### removeInvisibleMark(name: string) => void

清空该角色的名为name的隐藏mark。

### canUseCard(room: Room, cardId: [CardId](./card.md#type-cardid) | [CardMatcher](./card_matcher.md), onResponse?: [CardMatcher](./card_matcher.md)) => boolean

判断该角色能否使用某一张/某一种卡牌。

### resetCardUseHistory(cardName?: string) => void

将[CardUseHistory](#cardusehistory-cardid)属性置为空数组。

### resetSkillUseHistory(skillName: string) => void

使该角色某技能使用次数变成0。

### useCard(cardId: [CardId](./card.md#type-cardid)) => void

该角色的[CardUseHistory](#cardusehistory-cardid)属性追加cardId。

### useSkill(skillName: string) => void

该角色名为skillName的技能的使用次数+1。

### getCardIds\<T extends [CardId](./card.md#type-cardid) | [CharacterId](./character.md#type-characterid) = [CardId](./card.md#type-cardid)>(area?: [PlayerCardsArea](#const-enum-playercardsarea), outsideAreaName?: string) => T\[\]

返回该角色某区域的所有卡牌的id。若area不指定，则返回手牌区、装备区、判定区的卡牌；若area为游戏外牌堆且指定了名字，则返回那个牌堆的所有卡牌的id。

### setCharacterOutsideAreaCards(areaName: string, characterIds: [CharacterId](./character.md#type-characterid)[]) => void

在一个游戏外牌堆放入一些武将牌。

### isCharacterOutsideArea(areaName: string) => boolean

判断某游戏外牌堆是否有武将牌。

### getOutsideAreaNameOf\<T extends [CardId](./card.md#type-cardid) | [CharacterId](./character.md#type-characterid)>(cardId: T) => string | undefined

根据[CardId](./card.md#type-cardid)或[CharacterId](./character.md#type-characterid)返回它所在的游戏外牌堆名字（没有的话返回undefined）。

### getOutsideAreaCards() => [PlayerCardsOutside](#type-playercardsoutside)

获取该角色的所有游戏外牌堆。

### getPlayerCards() => [CardId](./card.md#type-cardid)[]

获取该角色手牌区和装备区的所有牌。

### getWeaponCardId() => [CardId](./card.md#type-cardid) | undefined

获取该角色已装备武器的id。没装备武器的话返回undefined。

### getCardId(cardId: [CardId](./card.md#type-cardid)) => [CardId](./card.md#type-cardid) | undefined

判断该角色的手牌区、装备区、判定区是否存在id为[CardId](./card.md#type-cardid)的卡牌。

### cardFrom(cardId: [CardId](./card.md#type-cardid)) => [PlayerCardsArea](#const-enum-playercardsarea) | undefined

获取某一张卡牌位于该角色的哪个区域。如果没有此卡牌，返回undefined。

### obtainCardIds(...cards: [CardId](./card.md#type-cardid)[]) => void

该角色的手牌中追加cards。

### dropCards(...cards: [CardId](./card.md#type-cardid)[]) => [CardId](./card.md#type-cardid)[]

弃掉该角色的一些卡牌。

### equip(equipCard: EquipCard) => [CardId](./card.md#type-cardid)

使该角色装备上一件装备。

### isInjured() => boolean

判断该角色是否已受伤。

### getDrunk() => void

判断该角色是否带有【酒】的效果。

### hasDrunk() => number

判断该角色【酒】效果的叠加数目。

### clearHeaded() => void

使该角色【酒】效果的叠加数目变成0。

### canUseCardTo(room: Room, cardId: [CardId](./card.md#type-cardid) | [CardMatcher](./card_matcher.md), target: PlayerId) => boolean

判断该角色能否对target使用一张/一种牌。

### getEquipment(cardType: CardType) => string | number | undefined

获得该角色装备区内某种类型的装备。

### hasCard(room: Room, cardMatcherOrId: [CardId](./card.md#type-cardid) | [CardMatcher](./card_matcher.md), areas?: [PlayerCardsArea](#const-enum-playercardsarea), outsideName?: string) => boolean

判断该角色是否拥有某某卡牌。

### hasUsed(cardName: string) => boolean

判断该角色是否用过某种牌名的牌。

### cardUsedTimes(cardSkillName: [CardId](./card.md#type-cardid) | [CardMatcher](./card_matcher.md)) => number

获得该角色使用某张/某种卡牌的次数。

### hasUsedSkill(skillName: string) => boolean

判断该角色是否已使用过某某技能。

### hasUsedSkillTimes(skillName: string) => number

获得该角色使用过某某技能的次数。

### getAttackDistance(room: Room) => number

获得该角色的攻击距离。

### getAttackRange(room: Room) => number

获得该角色的攻击范围。

### getMaxCardHold(room: Room) => number

获得该角色的手牌上限数。

### getOffenseDistance(room: Room) => number

获得该角色与其他角色计算距离时应该减少的距离数（或者说-1马buff数量）。

### getDefenseDistance(room: Room) => number

获得其他角色与该角色计算距离时应该增加的距离数（或者说+1马buff数量）。

### getCardUsableDistance(room: Room, cardId?: [CardId](./card.md#type-cardid), target?: [Player](#player-class)) => number

获得该角色的某卡牌合法使用的距离限制。

### getCardAdditionalUsableNumberOfTargets(room: Room, cardId: [CardId](./card.md#type-cardid) | [CardMatcher](./card_matcher.md)) => number

获得该角色的某卡牌可指定的额外目标的数量。

### getEquipSkills\<T extends Skill = Skill>(skillType?: [SkillStringType](#type-skillstringtype)) => T[]

获得该角色的所有（符合某某类型的，若不指定类型则为任意类型）装备技能。

### getPlayerSkills\<T extends Skill = Skill>(skillType?: [SkillStringType](#type-skillstringtype), includeDisabled?: boolean) => T[]

获得该角色的所有（符合某某类型的，若不指定类型则为任意类型）技能。若指定includeDisabled为true，则还会返回无效化的技能。

### getSkills\<T extends Skill = Skill>(skillType?: [SkillStringType](#type-skillstringtype)) => T[]

获得该角色的所有（符合某某类型的，若不指定类型则为任意类型）技能与装备技能。

### loseSkill(skillName: string | string[]) => [Skill](./skill.md)[]

使该角色失去一个或多个技能，并返回失去的技能。（连带隐藏技能）

### obtainSkill(skillName: string) => void

使该角色获得一个技能。（排除重复技能，会连带上与该技能相关的隐藏技能）

### addSkill(skill: [Skill](./skill.md)) => void

为该角色添加一个技能。

### removeSkill(skill: [Skill](./skill.md)) => void

移除该角色的一个技能。

### hasSkill(skillName: string) => boolean

判断该角色是否拥有某技能。

### hasShadowSkill(skillName: string) => boolean

判断该角色是否拥有某技能的隐藏技能之一。

### turnOver() => void

令该角色翻面。

### isFaceUp() => boolean

判断该角色是否正面向上。

### changeHp(amount: number) => void

使该角色的hp增加amount数量。

### bury() => void

重置该角色的武将牌，并将Dead属性置为true。

### getPlayerInfo() => [PlayerInfo](#interface-playerinfo)

获得该角色的在PlayerInfo接口内定义了的所有属性。

### setHuaShenInfo(info: [HuaShenInfo](#type-huasheninfo)) => void

将该角色的化身信息设置为特定的info。

### getHuaShenInfo() => [HuashenInfo](#type-huasheninfo) | undefined

获得该角色的化身信息。

### setOffline(quit?: boolean) => void

将该角色的状态设置为离线（若quit为true，则设置为逃跑）。

### setOnline() => void

将该角色的状态设置为在线。

### isOnline() => boolean

判断该角色是否在线。

### delegateOnTrusted(trusted: boolean) => void

按下托管按钮后的行为。

### isTrusted() => boolean

判断该角色是否处于托管状态。

### getPlayerStatus() => [PlayerStatus](#const-enum-playerstatus)

获得该角色的网络状态。

___

## Related Non-members

### type PlayerId

string的别名。

### type PlayerCardsOutside

```typescript
export type PlayerCardsOutside = {
  [SkillName: string]: (CardId | CharacterId)[];
};
```

表示某种对象的类型，该对象的key是string类型，value是[CardId](./card.md#type-cardid)和[CharacterId](./character.md#type-characterid)的联合类型的数组。注意到value也可能是[CharacterId](./character.md#type-characterid)数组，这是因为化身也通过该类型存放化身牌。

### type PlayerCards

```typescript
export type PlayerCards = {
  [K in Extract<PlayerCardsArea, Exclude<PlayerCardsArea, PlayerCardsArea.OutsideArea>>]: CardId[];
};
```

表示某种对象的类型，该对象的key是[PlayerCardsArea](#const-enum-playercardsarea)的枚举类型，value是[CardId](./card.md#type-cardid)数组。

### const enum PlayerRole

| 常量                | 值  | 描述     |
| ------------------- | --- | -------- |
| PlayerRole.Unknown  | 0   | 未知身份 |
| PlayerRole.Lord     | 1   | 主公     |
| PlayerRole.Loyalist | 2   | 忠臣     |
| PlayerRole.Rebel    | 3   | 反贼     |
| PlayerRole.Renegade | 4   | 内奸     |

### const enum PlayerCardsArea

| 常量                        | 值  | 描述                       |
| --------------------------- | --- | -------------------------- |
| PlayerCardsArea.HandArea    | 0   | 手牌区                     |
| PlayerCardsArea.EquipArea   | 1   | 装备区                     |
| PlayerCardsArea.JudgeArea   | 2   | 判定区                     |
| PlayerCardsArea.OutsideArea | 3   | 游戏外牌堆（如屯田的“田”） |

### const enum PlayerStatus

| 常量                 | 值          | 描述 |
| -------------------- | ----------- | ---- |
| PlayerStatus.Online  | `'online'`  | 在线 |
| PlayerStatus.Offline | `'offline'` | 离线 |
| PlayerStatus.Quit    | `'quit'`    | 逃跑 |
| PlayerStatus.Trusted | `'trusted'` | 托管 |

### interface PlayerInfo

```typescript
export interface PlayerInfo {
  Id: PlayerId;
  Name: string;
  Position: number;
  CharacterId: CharacterId | undefined;
  Nationality: CharacterNationality | undefined;
  Role: PlayerRole | undefined;
  Hp: number;
  MaxHp: number;
}
```

Player类即是该接口的实现。

### const enum DistanceType

| 常量                 | 值  | 描述             |
| -------------------- | --- | ---------------- |
| DistanceType.Offense | 0   | 减自己到别人距离 |
| DistanceType.Defense | 1   | 加别人到自己距离 |
| DistanceType.Attack  | 2   | 加攻击距离       |

该枚举似乎还没有被使用过。

### type SkillStringType

```typescript
type SkillStringType =
  | 'trigger'
  | 'common'
  | 'limit'
  | 'awaken'
  | 'compulsory'
  | 'active'
  | 'filter'
  | 'globalFilter'
  | 'breaker'
  | 'transform'
  | 'viewAs';
```

### type HuaShenInfo

```typescript
export type HuaShenInfo = {
  skillName: string;
  characterId: CharacterId;
};
```
