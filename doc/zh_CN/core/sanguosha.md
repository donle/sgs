# Sanguosha Class

> [DSanguosha](../index.md) > [Core](./core_index.md) > Sanguosha

___

Sanguosha保存了游戏内的许多要素（武将、卡牌、之类的）。

[查看源文件...](../../../src/core/game/engine.ts)

- [Sanguosha Class](#sanguosha-class)
  - [Properties Documentation](#properties-documentation)
    - [Version: string](#version-string)
    - [PlainVersion: string](#plainversion-string)
  - [Static Public Members](#static-public-members)
    - [initialize() => void](#initialize--void)
    - [isTransformCardSill(skillName: string) => boolean](#istransformcardsillskillname-string--boolean)
    - [getCardTypeByName(cardName: string) => CardType[]](#getcardtypebynamecardname-string--cardtype)
    - [getCardNameByType(finder: (types: CardType[]) => string[]](#getcardnamebytypefinder-types-cardtype--string)
    - [loadCards(...cards: GameCardExtensions[]) => Card[]](#loadcardscards-gamecardextensions--card)
    - [loadCharacters(disabledCharacters: CharacterId[] = [], ...characters: GameCharacterExtensions[]) => Character[]](#loadcharactersdisabledcharacters-characterid---characters-gamecharacterextensions--character)
    - [getCharacterById(characterId: CharacterId) => Character](#getcharacterbyidcharacterid-characterid--character)
    - [getVirtualCardById\<T extends Card>(cardId: VirtualCardId) => VirtualCard\<T>](#getvirtualcardbyidt-extends-cardcardid-virtualcardid--virtualcardt)
    - [getCardById\<T extends Card>(cardId: CardId) => T](#getcardbyidt-extends-cardcardid-cardid--t)
    - [getCardsByMatcher(matcher: CardMatcher) => Card[]](#getcardsbymatchermatcher-cardmatcher--card)
    - [getCardByName\<T extends Card>(cardName: string) => T](#getcardbynamet-extends-cardcardname-string--t)
    - [getSkillBySkillName\<T extends Skill = Skill>(name: string) => T](#getskillbyskillnamet-extends-skill--skillname-string--t)
    - [getShadowSkillsBySkillName\<T extends Skill = Skill>(name: ### string) => T[]](#getshadowskillsbyskillnamet-extends-skill--skillname--string--t)
    - [isShadowSkillName(name: string) => boolean](#isshadowskillnamename-string--boolean)
    - [getCharacterByCharaterName(name: string) => Character](#getcharacterbycharaternamename-string--character)
    - [getRandomCharacters](#getrandomcharacters)
    - [getAllCharacters(except: CharacterId[] = []) => Character[]](#getallcharactersexcept-characterid----character)
    - [getLordCharacters(packages: GameCharacterExtensions[]) => Character[]](#getlordcharacterspackages-gamecharacterextensions--character)
    - [isVirtualCardId(cardId: CardId) => boolean](#isvirtualcardidcardid-cardid--boolean)
    - [getGameCharacterExtensions() => GameCharacterExtensions[]](#getgamecharacterextensions--gamecharacterextensions)
    - [getNationalitiesList() => CharacterNationality[]](#getnationalitieslist--characternationality)

___

## Properties Documentation

### Version: string

游戏的版本，包括版本号和版本类型（比如Alpha版、Beta版之类的？）

### PlainVersion: string

游戏的版本号。具体点[这里](../../../src/core/game/version.ts)查看。

___

## Static Public Members

### initialize() => void

初始化整个Sanguosha类的私有静态成员（？），加载好技能、卡牌、武将。

### isTransformCardSill(skillName: string) => boolean

判断一个技能是否是卡牌转换技（像是天香、武神之类的技能）。

### getCardTypeByName(cardName: string) => CardType[]

根据卡牌名获取该卡牌的类型。

### getCardNameByType(finder: (types: CardType[]) => string[]

获得所有符合该类型的卡牌。

### loadCards(...cards: GameCardExtensions[]) => Card[]

获得一些卡牌包中的所有卡牌。

### loadCharacters(disabledCharacters: CharacterId[] = [], ...characters: GameCharacterExtensions[]) => Character[]

获得一些武将包中的所有武将，可以指定禁将列表。

### getCharacterById(characterId: CharacterId) => Character

根据指定Id返回相应的武将。

### getVirtualCardById\<T extends Card>(cardId: VirtualCardId) => VirtualCard\<T>

根据指定Id获取相应的虚拟卡。

### getCardById\<T extends Card>(cardId: CardId) => T

根据指定Id获取相应的卡牌。

### getCardsByMatcher(matcher: CardMatcher) => Card[]

返回符合matcher条件的所有卡牌。

### getCardByName\<T extends Card>(cardName: string) => T

根据牌名获得某卡牌。

### getSkillBySkillName\<T extends Skill = Skill>(name: string) => T

根据技能名字获得技能。

### getShadowSkillsBySkillName\<T extends Skill = Skill>(name: ### string) => T[]

根据技能的名字获取该技能的所有隐藏技能。

### isShadowSkillName(name: string) => boolean

判断某技能名是否是隐藏技能名。

`隐藏技能的名字以'#'开头。`

### getCharacterByCharaterName(name: string) => Character

根据名字获得相应的武将。

### getRandomCharacters

```ts
public static getRandomCharacters(
  numberOfCharacters: number,
  charactersPool: Character[] = this.characters,
  except: CharacterId[],
  filter?: (characer: Character) => boolean,
) => Character[]
```

随机获得一定数量的武将。

### getAllCharacters(except: CharacterId[] = []) => Character[]

获得所有武将。可以指定禁表。

### getLordCharacters(packages: GameCharacterExtensions[]) => Character[]

获得指定武将包中的所有主公武将。

### isVirtualCardId(cardId: CardId) => boolean

判断某cardId是否为虚拟卡的id。

`虚拟卡的cardId为string类型，而实体卡为number类型。`

### getGameCharacterExtensions() => GameCharacterExtensions[]

获得所有的武将包。

### getNationalitiesList() => CharacterNationality[]

获得所有的势力。
