import { PlayerAI } from 'core/ai/ai';
import { TrustAI } from 'core/ai/trust_ai';
import { Card, CardType, VirtualCard } from 'core/cards/card';
import { ArmorCard, EquipCard, WeaponCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  Character,
  CharacterEquipSections,
  CharacterGender,
  CharacterId,
  CharacterNationality,
} from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { UPPER_LIMIT_OF_ARMOR } from 'core/game/game_props';
import {
  PlayerCards,
  PlayerCardsArea,
  PlayerCardsOutside,
  PlayerId,
  PlayerInfo,
  PlayerRole,
  PlayerShortcutInfo,
  PlayerStatus,
} from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import {
  ActiveSkill,
  FilterSkill,
  GlobalFilterSkill,
  GlobalRulesBreakerSkill,
  RulesBreakerSkill,
  Skill,
  SkillLifeCycle,
  SkillProhibitedSkill,
  SkillType,
  SwitchSkillState,
  TransformSkill,
  TriggerSkill,
  ViewAsSkill,
} from 'core/skills/skill';
import { UniqueSkillRule } from 'core/skills/skill_rule';

type SkillStringType =
  | 'trigger'
  | 'common'
  | 'limit'
  | 'awaken'
  | 'compulsory'
  | 'switch'
  | 'quest'
  | 'active'
  | 'filter'
  | 'globalFilter'
  | 'breaker'
  | 'globalBreaker'
  | 'transform'
  | 'viewAs'
  | 'skillProhibited';

export type HuaShenInfo = {
  skillName: string;
  characterId: CharacterId;
};

export abstract class Player implements PlayerInfo {
  private hp: number;
  private maxHp: number;
  private armor: number;
  private dying: boolean = false;
  private dead: boolean;
  private chainLocked: boolean = false;
  private turnedOver: boolean = false;
  private playerSkills: Skill[] = [];
  private hookedSkills: Skill[] = [];
  private gender: CharacterGender;
  private equipSectionsStatus: {
    [K in CharacterEquipSections]: 'enabled' | 'disabled';
  } = {
    [CharacterEquipSections.Weapon]: 'enabled',
    [CharacterEquipSections.Shield]: 'enabled',
    [CharacterEquipSections.DefenseRide]: 'enabled',
    [CharacterEquipSections.OffenseRide]: 'enabled',
    [CharacterEquipSections.Precious]: 'enabled',
  };
  private judgeAreaStatus: 'enabled' | 'disabled' = 'enabled';

  private drunk: number = 0;

  protected abstract status: PlayerStatus;
  protected abstract playerId: PlayerId;
  protected abstract playerName: string;
  protected abstract playerPosition: number;
  protected ready: boolean = false;
  protected playerRole: PlayerRole = PlayerRole.Unknown;
  protected nationality: CharacterNationality;
  protected huashenInfo: HuaShenInfo | undefined;

  private cardUseHistory: CardId[] = [];
  private skillUsedHistory: {
    [K: string]: number;
  }[] = [];
  private switchSkillState: string[] = [];
  private playerCharacter: Character | undefined;
  protected playerCards: PlayerCards;
  protected playerOutsideCards: PlayerCardsOutside;
  protected playerOutsideCharactersAreaNames: string[] = [];

  protected visiblePlayerTags: { [name: string]: string } = {};
  protected visiblePlayers: { [name: string]: PlayerId[] } = {};
  private flags: {
    [k: string]: any;
  } = {};
  private marks: {
    [markName: string]: number;
  } = {};
  private cardTags: {
    [cardTag: string]: CardId[];
  } = {};

  constructor(
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
    protected playerCharacterId?: CharacterId,
    private ai: PlayerAI = TrustAI.Instance,
  ) {
    if (playerCards) {
      this.playerCards = {
        [PlayerCardsArea.HandArea]: playerCards[PlayerCardsArea.HandArea],
        [PlayerCardsArea.JudgeArea]: playerCards[PlayerCardsArea.JudgeArea],
        [PlayerCardsArea.EquipArea]: playerCards[PlayerCardsArea.EquipArea],
      };
      this.playerOutsideCards = playerCards[PlayerCardsArea.OutsideArea];
    } else {
      this.playerCards = {
        [PlayerCardsArea.HandArea]: [],
        [PlayerCardsArea.JudgeArea]: [],
        [PlayerCardsArea.EquipArea]: [],
      };
      this.playerOutsideCards = {};
    }

    if (this.playerCharacterId != null) {
      this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
      if (this.hp == null) {
        this.hp = this.playerCharacter.MaxHp;
      }
      if (this.maxHp == null) {
        this.maxHp = this.playerCharacter.MaxHp;
      }
      if (this.nationality == null) {
        this.nationality = this.playerCharacter.Nationality;
      }
      if (this.gender == null) {
        this.gender = this.playerCharacter.Gender;
      }
      if (this.Armor == null) {
        this.Armor = this.playerCharacter.Armor;
      }
    }

    this.dead = false;
    // GameCommonRules.initPlayerCommonRules(this);
  }

  protected syncUpPlayer(playerInfo: PlayerShortcutInfo) {
    const {
      chainLocked,
      turnedOver,
      drunk,
      dead,
      equipSectionsStatus,
      judgeAreaStatus,
      playerCards,
      playerOutsideCards,
      playerOutsideCharactersAreaNames,
    } = playerInfo;

    this.chainLocked = chainLocked;
    this.turnedOver = turnedOver;
    this.drunk = drunk;
    this.dead = dead;
    this.equipSectionsStatus = equipSectionsStatus;
    this.judgeAreaStatus = judgeAreaStatus;
    this.playerCards = playerCards;
    this.playerOutsideCards = playerOutsideCards;
    this.playerOutsideCharactersAreaNames = playerOutsideCharactersAreaNames;
  }

  public clearFlags() {
    this.visiblePlayerTags = {};
    this.flags = {};
  }
  removeFlag(name: string) {
    delete this.visiblePlayerTags[name];
    delete this.visiblePlayers[name];
    delete this.flags[name];
  }
  setFlag<T>(name: string, value: T, tagName?: string, visiblePlayers?: PlayerId[]): T {
    if (tagName && this.visiblePlayerTags[name] !== tagName) {
      this.visiblePlayerTags[name] = tagName;
      if (visiblePlayers && visiblePlayers.length > 0) {
        this.visiblePlayers[name] = visiblePlayers;
      }
    } else if (!tagName && this.visiblePlayerTags[name] !== undefined) {
      delete this.visiblePlayerTags[name];
    }

    if (!this.visiblePlayerTags[name]) {
      delete this.visiblePlayers[name];
    } else if (visiblePlayers && visiblePlayers.length > 0) {
      this.visiblePlayers[name] = visiblePlayers;
    }

    return (this.flags[name] = value);
  }
  getFlag<T>(name: string): T {
    return this.flags[name];
  }

  get Flags() {
    return this.flags;
  }

  public clearMarks() {
    this.marks = {};
  }
  removeMark(name: string) {
    delete this.marks[name];
  }
  setMark(name: string, value: number) {
    return (this.marks[name] = value);
  }
  addMark(name: string, value: number) {
    if (this.marks[name] === undefined) {
      this.marks[name] = value;
    } else {
      this.marks[name] += value;
    }
    return this.marks[name];
  }
  getMark(name: string) {
    return this.marks[name] || 0;
  }
  get Marks() {
    return this.marks;
  }
  addInvisibleMark(name: string, value: number) {
    return this.addMark('!' + name, value);
  }
  getInvisibleMark(name: string) {
    return this.getMark('!' + name);
  }
  removeInvisibleMark(name: string) {
    this.removeMark('!' + name);
  }

  removeCardTag(cardTag: string) {
    delete this.cardTags[cardTag];
  }
  setCardTag(cardTag: string, cardIds: CardId[]) {
    this.cardTags[cardTag] = cardIds;
  }
  getCardTag(cardTag: string): CardId[] | undefined {
    return this.cardTags[cardTag];
  }
  getAllCardTags() {
    return this.cardTags;
  }
  clearCardTags() {
    this.cardTags = {};
  }

  public canUseCard(room: Room, cardId: CardId | CardMatcher, onResponse?: CardMatcher): boolean {
    const card = cardId instanceof CardMatcher ? cardId : Sanguosha.getCardById(cardId);
    const ruleCardUse = room.CommonRules.canUseCard(room, this, card);

    for (const skill of this.getSkills<FilterSkill>('filter')) {
      if (!skill.canUseCard(cardId, room, this.Id)) {
        return false;
      }
    }

    const canUseToSomeone = room.AlivePlayers.find(player => room.CommonRules.canUseCardTo(room, this, card, player));
    if (card instanceof Card) {
      if (canUseToSomeone) {
        return card.is(CardType.Equip)
          ? true
          : onResponse
          ? onResponse.match(card)
          : card.Skill.canUse(room, this, cardId);
      }
    } else {
      if (canUseToSomeone) {
        return onResponse ? onResponse.match(card) : true;
      }
    }

    return ruleCardUse;
  }

  public resetCardUseHistory(cardName?: string) {
    if (cardName !== undefined) {
      this.cardUseHistory = this.cardUseHistory.filter(card => Sanguosha.getCardById(card).GeneralName !== cardName);
    } else {
      this.cardUseHistory = [];
    }
  }

  public resetSkillUseHistory(skillName: string) {
    this.skillUsedHistory[skillName] = 0;
  }

  public useCard(cardId: CardId) {
    this.cardUseHistory.push(cardId);
  }

  public useSkill(skillName: string) {
    if (this.skillUsedHistory[skillName] !== undefined) {
      this.skillUsedHistory[skillName]++;
    } else {
      this.skillUsedHistory[skillName] = 1;
    }

    const skill = Sanguosha.getSkillBySkillName(skillName);
    if (skill.isSwitchSkill() && skill.isSwitchable()) {
      const generalName = skill.GeneralName;
      if (this.switchSkillState.includes(generalName)) {
        const index = this.switchSkillState.findIndex(name => name === generalName);
        this.switchSkillState.splice(index, 1);
      } else {
        this.switchSkillState.push(generalName);
      }
    }
  }

  public setupCards(area: PlayerCardsArea, cards: CardId[]) {
    this.playerCards[area] = cards;
  }

  public getCardIds<T extends CardId | CharacterId = CardId>(area?: PlayerCardsArea, outsideAreaName?: string): T[] {
    if (area === undefined) {
      const [handCards, judgeCards, equipCards] = Object.values<CardId[]>(this.playerCards);
      return [...handCards, ...judgeCards, ...equipCards] as unknown as T[];
    }

    if (area !== PlayerCardsArea.OutsideArea) {
      return this.playerCards[area] as unknown as T[];
    } else {
      outsideAreaName = Precondition.exists(outsideAreaName, `Unable to get ${outsideAreaName} area cards`);
      this.playerOutsideCards[outsideAreaName] = this.playerOutsideCards[outsideAreaName] || [];
      return this.playerOutsideCards[outsideAreaName] as unknown as T[];
    }
  }

  public getAllGameCards() {
    const allCards = this.getCardIds();
    for (const [areaName, outside] of Object.entries(this.playerOutsideCards)) {
      if (this.playerOutsideCharactersAreaNames.includes(areaName)) {
        continue;
      }

      allCards.push(...outside);
    }

    return allCards;
  }

  public setCharacterOutsideAreaCards(areaName: string, characterIds: CharacterId[]) {
    if (!this.playerOutsideCharactersAreaNames.includes(areaName)) {
      this.playerOutsideCharactersAreaNames.push(areaName);
    }
    this.playerOutsideCards[areaName] = characterIds;
  }

  public isCharacterOutsideArea(areaName: string) {
    return this.playerOutsideCharactersAreaNames.includes(areaName);
  }

  public getOutsideAreaNameOf<T extends CardId | CharacterId>(cardId: T) {
    for (const [areaName, cards] of Object.entries(this.playerOutsideCards)) {
      if (cards.includes(cardId)) {
        return areaName;
      }
    }
  }

  public getOutsideAreaCards() {
    return this.playerOutsideCards;
  }

  public getPlayerCards(): CardId[] {
    return [...this.playerCards[PlayerCardsArea.EquipArea], ...this.playerCards[PlayerCardsArea.HandArea]];
  }

  public getWeaponCardId(): CardId | undefined {
    return this.playerCards[PlayerCardsArea.EquipArea].find(card => Sanguosha.getCardById(card).is(CardType.Weapon));
  }

  public getCardId(cardId: CardId): CardId | undefined {
    for (const card of Object.values(this.getCardIds())) {
      if (card === cardId) {
        return cardId;
      }
    }
  }

  public cardFrom(cardId: CardId): PlayerCardsArea | undefined {
    const realCardId = VirtualCard.getActualCards([cardId]);
    if (realCardId.length > 1) {
      return;
    } else {
      cardId = realCardId[0];
    }

    for (const [area, cards] of Object.entries(this.playerCards) as [string, CardId[]][]) {
      const realCards = VirtualCard.getActualCards(cards);
      if (realCards.find(card => card === cardId)) {
        return parseInt(area, 10) as PlayerCardsArea;
      }
    }

    for (const [, cards] of Object.entries(this.getOutsideAreaCards())) {
      const realCards = VirtualCard.getActualCards(cards);
      if (realCards.find(card => card === cardId)) {
        return PlayerCardsArea.OutsideArea;
      }
    }
  }

  public obtainCardIds(...cards: CardId[]) {
    const handCards = this.getCardIds(PlayerCardsArea.HandArea);
    for (const card of VirtualCard.getActualCards(cards)) {
      handCards.push(card);
    }
  }

  private hasCardOrSubCardsInCards(sectionCards: CardId[], cardId: CardId) {
    const index = sectionCards.findIndex(sectionCardId => sectionCardId === cardId);
    if (index >= 0) {
      return true;
    }

    if (Card.isVirtualCardId(cardId)) {
      const targetCardRealCards = VirtualCard.getActualCards([cardId]);
      return (
        Algorithm.intersection(VirtualCard.getActualCards(sectionCards), targetCardRealCards).length ===
        targetCardRealCards.length
      );
    }

    return false;
  }

  dropCards(...cards: CardId[]): CardId[] {
    const areaCardsList: CardId[][] = [
      this.playerCards[PlayerCardsArea.HandArea],
      this.playerCards[PlayerCardsArea.EquipArea],
      this.playerCards[PlayerCardsArea.JudgeArea],
      ...Object.entries(this.playerOutsideCards)
        .filter(([areaName]) => !this.isCharacterOutsideArea(areaName))
        .map(([, cards]) => cards),
    ];

    for (const card of cards) {
      if (VirtualCard.getActualCards([card]).length === 0) {
        continue;
      }

      const droppedCards: CardId[] = [];
      const realCards = VirtualCard.getActualCards([card]);

      for (const areaCards of areaCardsList) {
        for (const card of realCards) {
          const index = areaCards.findIndex(
            areaCard => areaCard === card || VirtualCard.getActualCards([areaCard]).includes(card),
          );
          if (index >= 0) {
            areaCards.splice(index, 1);
            droppedCards.push(card);
          }
        }
      }

      if (droppedCards.length !== realCards.length) {
        throw new Error(`Unexpected card drop from player ${this.Name}`);
      }
    }

    return cards;
  }

  public canEquip(equipCard: EquipCard) {
    if (equipCard.is(CardType.Weapon)) {
      return this.equipSectionsStatus[CharacterEquipSections.Weapon] === 'enabled';
    }
    if (equipCard.is(CardType.Shield)) {
      return this.equipSectionsStatus[CharacterEquipSections.Shield] === 'enabled';
    }
    if (equipCard.is(CardType.DefenseRide)) {
      return this.equipSectionsStatus[CharacterEquipSections.DefenseRide] === 'enabled';
    }
    if (equipCard.is(CardType.OffenseRide)) {
      return this.equipSectionsStatus[CharacterEquipSections.OffenseRide] === 'enabled';
    }
    if (equipCard.is(CardType.Precious)) {
      return this.equipSectionsStatus[CharacterEquipSections.Precious] === 'enabled';
    }

    return false;
  }

  public canEquipTo(section: CharacterEquipSections) {
    return this.equipSectionsStatus[section] === 'enabled';
  }

  public getEmptyEquipSections(): CardType[] {
    let allEquipTypes = [
      CardType.Weapon,
      CardType.Shield,
      CardType.DefenseRide,
      CardType.OffenseRide,
      CardType.Precious,
    ];
    if (this.playerCards[PlayerCardsArea.EquipArea].length > 0) {
      allEquipTypes = allEquipTypes.filter(
        type => !this.playerCards[PlayerCardsArea.EquipArea].find(id => Sanguosha.getCardById(id).is(type)),
      );
    }

    const cardTypeMapper = {
      [CardType.Weapon]: CharacterEquipSections.Weapon,
      [CardType.Shield]: CharacterEquipSections.Shield,
      [CardType.DefenseRide]: CharacterEquipSections.DefenseRide,
      [CardType.OffenseRide]: CharacterEquipSections.OffenseRide,
      [CardType.Precious]: CharacterEquipSections.Precious,
    };
    return allEquipTypes.filter(type => this.equipSectionsStatus[cardTypeMapper[type]] === 'enabled');
  }

  public equip(equipCard: EquipCard) {
    Precondition.assert(
      !this.playerCards[PlayerCardsArea.EquipArea].find(card =>
        Sanguosha.getCardById<EquipCard>(card).is(equipCard.EquipType),
      ),
      'Unexpected existing equip card in equip area',
    );

    Precondition.assert(
      !this.playerCards[PlayerCardsArea.HandArea].find(cardId => equipCard.Id === cardId),
      'Unexpected existing equip card in hand area',
    );

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard.Id);
    return equipCard.Id;
  }

  public isInjured() {
    return this.Hp < this.MaxHp;
  }

  public getDrunk() {
    this.drunk++;
  }
  public hasDrunk() {
    return this.drunk;
  }
  public clearHeaded() {
    this.drunk = 0;
  }

  public canUseCardTo(room: Room, cardId: CardId | CardMatcher, target: PlayerId, unlimited?: boolean): boolean {
    const player = room.getPlayerById(target);

    for (const skillOwner of room.getAlivePlayersFrom()) {
      for (const skill of skillOwner.getSkills<GlobalFilterSkill>('globalFilter')) {
        if (!skill.canUseCardTo(cardId, room, skillOwner, this, room.getPlayerById(target))) {
          return false;
        }
      }
    }

    for (const skill of player.getSkills<FilterSkill>('filter')) {
      if (!skill.canBeUsedCard(cardId, room, target, this.Id)) {
        return false;
      }
    }
    for (const skill of this.getSkills<FilterSkill>('filter')) {
      if (!skill.canUseCard(cardId, room, this.Id)) {
        return false;
      }
    }

    const card = cardId instanceof CardMatcher ? undefined : Sanguosha.getCardById(cardId);
    if (card) {
      if (
        (card.is(CardType.Equip) && !player.canEquip(card as EquipCard)) ||
        (card.is(CardType.DelayedTrick) &&
          (player.judgeAreaDisabled() ||
            player
              .getCardIds(PlayerCardsArea.JudgeArea)
              .find(id => Sanguosha.getCardById(id).GeneralName === card.GeneralName) !== undefined))
      ) {
        return false;
      }
    }

    return (
      unlimited ||
      room.CommonRules.canUseCardTo(
        room,
        this,
        cardId instanceof CardMatcher ? cardId : Sanguosha.getCardById(cardId),
        room.getPlayerById(target),
      )
    );
  }

  public getEquipment(cardType: CardType): CardId | undefined {
    return this.playerCards[PlayerCardsArea.EquipArea].find(cardId => Sanguosha.getCardById(cardId).is(cardType));
  }

  public getShield(): ArmorCard | undefined {
    const cardId = this.playerCards[PlayerCardsArea.EquipArea].find(cardId =>
      Sanguosha.getCardById(cardId).is(CardType.Shield),
    );
    if (cardId === undefined) {
      return;
    }

    return Sanguosha.getCardById<ArmorCard>(cardId);
  }

  public getWeapon(): WeaponCard | undefined {
    const cardId = this.playerCards[PlayerCardsArea.EquipArea].find(cardId =>
      Sanguosha.getCardById(cardId).is(CardType.Weapon),
    );
    if (cardId === undefined) {
      return;
    }

    return Sanguosha.getCardById<WeaponCard>(cardId);
  }

  public hasCard(room: Room, cardMatcherOrId: CardId | CardMatcher, areas?: PlayerCardsArea, outsideName?: string) {
    if (cardMatcherOrId instanceof CardMatcher) {
      const findCard = this.getCardIds(areas, outsideName).find(cardId => {
        const card = Sanguosha.getCardById(cardId);
        return cardMatcherOrId.match(card);
      });

      if (findCard) {
        return true;
      }

      const skill = this.getSkills<ViewAsSkill>('viewAs').find(skill => {
        const viewAsCards = skill.canViewAs(room, this, undefined, cardMatcherOrId);
        return (
          skill.canUse(room, this) && CardMatcher.match(CardMatcher.addTag({ name: viewAsCards }), cardMatcherOrId)
        );
      });

      return !!skill;
    } else {
      if (this.getCardId(cardMatcherOrId) !== undefined) {
        return true;
      }

      const card = Sanguosha.getCardById(cardMatcherOrId);
      const skill = this.getSkills<ViewAsSkill>('viewAs').find(skill =>
        skill.canViewAs(room, this).includes(card.GeneralName),
      );

      return !!skill;
    }
  }

  public hasUsed(cardName: string): boolean {
    return this.cardUseHistory.find(cardId => Sanguosha.getCardById(cardId).Name === cardName) !== undefined;
  }
  public cardUsedTimes(cardSkillName: CardId | CardMatcher): number {
    const trendToUse = cardSkillName instanceof CardMatcher ? cardSkillName : Sanguosha.getCardById(cardSkillName);
    return this.cardUseHistory.filter(cardId => {
      const card = Sanguosha.getCardById(cardId);
      return trendToUse instanceof CardMatcher ? trendToUse.match(card) : card.GeneralName === trendToUse.GeneralName;
    }).length;
  }

  public hasUsedSkill(skillName: string): boolean {
    return !!this.skillUsedHistory[skillName] && this.skillUsedHistory[skillName] > 0;
  }
  public hasUsedSkillTimes(skillName: string): number {
    return this.skillUsedHistory[skillName] === undefined ? 0 : this.skillUsedHistory[skillName];
  }

  public getSwitchSkillState(skillName: string, beforeUse: boolean = false): SwitchSkillState {
    const skill = Sanguosha.getSkillBySkillName(skillName);
    Precondition.assert(skill.isSwitchSkill(), `${skillName} isn't switch skill`);
    if (skill.isShadowSkill()) {
      skillName = skill.GeneralName;
    }
    const judge = beforeUse ? this.switchSkillState.includes(skillName) : !this.switchSkillState.includes(skillName);
    return judge ? SwitchSkillState.Yin : SwitchSkillState.Yang;
  }

  public refreshOnceSkill(skillName: string): boolean {
    const skill = Sanguosha.getSkillBySkillName(skillName);
    Precondition.assert(
      skill.SkillType === SkillType.Limit || skill.SkillType === SkillType.Awaken,
      `${skillName} isn't once skill`,
    );
    if (this.skillUsedHistory[skillName] > 0) {
      this.skillUsedHistory[skillName] = 0;
      return true;
    }

    return false;
  }

  public getAttackRange(room: Room, except?: CardId[]) {
    let attackDistance = 1;
    for (const cardId of this.getCardIds(PlayerCardsArea.EquipArea)) {
      const card = Card.isVirtualCardId(cardId)
        ? Sanguosha.getCardById<VirtualCard<WeaponCard>>(cardId).ViewAsCard
        : Sanguosha.getCardById(cardId);

      if (card instanceof WeaponCard && !except?.includes(card.Id)) {
        attackDistance = card.AttackDistance;
      }
    }

    let additionalAttackRange: number = 0;
    for (const skill of this.getSkills<RulesBreakerSkill>('breaker')) {
      additionalAttackRange += skill.breakAdditionalAttackRange(room, this);
    }
    additionalAttackRange += room.CommonRules.getAdditionalAttackDistance(this);

    let finalAttackRange: number = -1;
    for (const skill of this.getSkills<RulesBreakerSkill>('breaker')) {
      const newFinalAttackRange = skill.breakFinalAttackRange(room, this);
      if (newFinalAttackRange > finalAttackRange) {
        finalAttackRange = newFinalAttackRange;
      }
    }

    return Math.max(finalAttackRange >= 0 ? finalAttackRange : attackDistance + additionalAttackRange, 0);
  }

  public getMaxCardHold(room: Room) {
    const maxCardHold =
      room.CommonRules.getBaseHoldCardNumber(room, this) + room.CommonRules.getAdditionalHoldCardNumber(room, this);

    return Math.max(maxCardHold, 0);
  }

  public getOffenseDistance(room: Room) {
    return room.CommonRules.getAdditionalOffenseDistance(room, this);
  }

  public getDefenseDistance(room: Room) {
    return room.CommonRules.getAdditionalDefenseDistance(room, this);
  }

  public getCardUsableDistance(room: Room, cardId?: CardId, target?: Player) {
    const card = cardId ? Sanguosha.getCardById(cardId) : undefined;
    return (
      (card ? card.EffectUseDistance : 0) + room.CommonRules.getCardAdditionalUsableDistance(room, this, card, target)
    );
  }

  public getCardAdditionalUsableNumberOfTargets(room: Room, cardId: CardId | CardMatcher) {
    const card = cardId instanceof CardMatcher ? cardId : Sanguosha.getCardById(cardId);
    return room.CommonRules.getCardAdditionalNumberOfTargets(room, this, card);
  }

  public getEquipSkills<T extends Skill = Skill>(skillType?: SkillStringType) {
    const equipCards = this.playerCards[PlayerCardsArea.EquipArea].map(card => Sanguosha.getCardById(card));
    const skills = equipCards.reduce<Skill[]>((skills, card) => skills.concat([card.Skill, ...card.ShadowSkills]), []);
    if (skillType === undefined) {
      return skills as T[];
    }

    switch (skillType) {
      case 'filter':
        return skills.filter(skill => skill instanceof FilterSkill) as T[];
      case 'globalFilter':
        return skills.filter(skill => skill instanceof GlobalFilterSkill) as T[];
      case 'active':
        return skills.filter(skill => skill instanceof ActiveSkill) as T[];
      case 'viewAs':
        return skills.filter(skill => skill instanceof ViewAsSkill) as T[];
      case 'trigger':
        return skills.filter(skill => skill instanceof TriggerSkill) as T[];
      case 'breaker':
        return skills.filter(skill => skill instanceof RulesBreakerSkill) as T[];
      case 'globalBreaker':
        return skills.filter(skill => skill instanceof GlobalRulesBreakerSkill) as T[];
      case 'compulsory':
        return skills.filter(skill => skill.SkillType === SkillType.Compulsory) as T[];
      case 'awaken':
        return skills.filter(skill => skill.SkillType === SkillType.Awaken) as T[];
      case 'limit':
        return skills.filter(skill => skill.SkillType === SkillType.Limit) as T[];
      case 'common':
        return skills.filter(skill => skill.SkillType === SkillType.Common) as T[];
      case 'transform':
        return skills.filter(skill => skill instanceof TransformSkill) as T[];
      case 'switch':
        return skills.filter(skill => skill.isSwitchSkill()) as T[];
      case 'skillProhibited':
        return skills.filter(skill => skill instanceof SkillProhibitedSkill) as T[];
      case 'quest':
        return skills.filter(skill => skill.SkillType === SkillType.Quest) as T[];
      default:
        throw Precondition.UnreachableError(skillType);
    }
  }

  public getPlayerSkills<T extends Skill = Skill>(skillType?: SkillStringType, includeDisabled?: boolean): T[] {
    Precondition.assert(
      this.playerCharacter !== undefined,
      `Player ${this.playerName} has not been initialized with a character yet`,
    );

    const skills = [...this.playerSkills, ...this.hookedSkills].filter(
      skill => (includeDisabled || !UniqueSkillRule.isProhibited(skill, this)) && !skill.isSideEffectSkill(),
    );
    if (skillType === undefined) {
      return skills as T[];
    }

    switch (skillType) {
      case 'filter':
        return skills.filter(skill => skill instanceof FilterSkill) as T[];
      case 'globalFilter':
        return skills.filter(skill => skill instanceof GlobalFilterSkill) as T[];
      case 'viewAs':
        return skills.filter(skill => skill instanceof ViewAsSkill) as T[];
      case 'active':
        return skills.filter(skill => skill instanceof ActiveSkill) as T[];
      case 'trigger':
        return skills.filter(skill => skill instanceof TriggerSkill) as T[];
      case 'breaker':
        return skills.filter(skill => skill instanceof RulesBreakerSkill) as T[];
      case 'globalBreaker':
        return skills.filter(skill => skill instanceof GlobalRulesBreakerSkill) as T[];
      case 'transform':
        return skills.filter(skill => skill instanceof TransformSkill) as T[];
      case 'compulsory':
        return skills.filter(skill => skill.SkillType === SkillType.Compulsory) as T[];
      case 'awaken':
        return skills.filter(skill => skill.SkillType === SkillType.Awaken) as T[];
      case 'limit':
        return skills.filter(skill => skill.SkillType === SkillType.Limit) as T[];
      case 'common':
        return skills.filter(skill => skill.SkillType === SkillType.Common) as T[];
      case 'switch':
        return skills.filter(skill => skill.isSwitchSkill()) as T[];
      case 'skillProhibited':
        return skills.filter(skill => skill instanceof SkillProhibitedSkill) as T[];
      case 'quest':
        return skills.filter(skill => skill.SkillType === SkillType.Quest) as T[];
      default:
        throw Precondition.UnreachableError(skillType);
    }
  }

  public getSkills<T extends Skill = Skill>(skillType?: SkillStringType): T[] {
    return [...this.getEquipSkills<T>(skillType), ...this.getPlayerSkills<T>(skillType)];
  }

  public loseSkill(skillName: string | string[]) {
    const lostSkill: Skill[] = [];
    const existSkill: Skill[] = [];
    for (const skill of this.playerSkills) {
      if (skill.isStubbornSkill()) {
        existSkill.push(skill);
        continue;
      }

      if (typeof skillName === 'string') {
        if (skill.Name.endsWith(skillName)) {
          lostSkill.push(skill);
          if (SkillLifeCycle.isHookedAfterLosingSkill(skill)) {
            this.hookedSkills.push(skill);
          }
        } else {
          existSkill.push(skill);
        }
      } else {
        if (skillName.find(name => skill.Name.endsWith(name))) {
          lostSkill.push(skill);
          if (SkillLifeCycle.isHookedAfterLosingSkill(skill)) {
            this.hookedSkills.push(skill);
          }
        } else {
          existSkill.push(skill);
        }
      }
    }

    this.playerSkills = existSkill;
    return lostSkill;
  }

  public obtainSkill(skillName: string, insertIndex?: number) {
    const skill = Sanguosha.getSkillBySkillName(skillName);
    if (this.playerSkills.includes(skill)) {
      return;
    }

    this.hookedSkills = this.hookedSkills.filter(hookedSkill => hookedSkill !== skill);
    if (insertIndex !== undefined) {
      this.playerSkills.splice(insertIndex, 0, skill);
    } else {
      this.playerSkills.push(skill);
    }
    for (const shadowSkill of Sanguosha.getShadowSkillsBySkillName(skillName)) {
      this.hookedSkills = this.hookedSkills.filter(hookedSkill => hookedSkill !== shadowSkill);
      this.playerSkills.push(shadowSkill);
    }
  }

  public addSkill(skill: Skill) {
    this.playerSkills.push(skill);
  }
  public removeSkill(skill: Skill) {
    this.playerSkills = this.playerSkills.filter(existSkill => existSkill !== skill);
  }

  public hookUpSkills(skills: Skill[]) {
    this.hookedSkills.push(...skills.filter(skill => !this.hookedSkills.includes(skill)));
  }

  public removeHookedSkills(skills: Skill[]) {
    this.hookedSkills = this.hookedSkills.filter(skill => !skills.includes(skill));
  }

  public hasSkill(skillName: string) {
    return (
      this.playerSkills.find(skill => skill.Name === skillName) !== undefined ||
      this.hookedSkills.find(skill => skill.Name === skillName) !== undefined
    );
  }

  public hasShadowSkill(skillName: string) {
    return this.playerSkills.find(skill => skill.Name.startsWith('#') && skill.Name.endsWith(skillName)) !== undefined;
  }

  public getSkillProhibitedSkills(negative?: boolean): Skill[] {
    return this.playerSkills.filter(skill =>
      negative ? !(skill instanceof SkillProhibitedSkill) : skill instanceof SkillProhibitedSkill,
    );
  }

  public turnOver() {
    this.turnedOver = !this.turnedOver;
  }

  public isFaceUp() {
    return !this.turnedOver;
  }

  public changeHp(amount: number) {
    this.hp += amount;
  }

  public changeArmor(amount: number) {
    this.armor += amount;
  }

  public get Hp() {
    return this.hp;
  }
  public set Hp(hp: number) {
    this.hp = hp;
  }

  public get Armor() {
    return this.armor;
  }

  public set Armor(armor: number) {
    this.armor = Math.min(armor, UPPER_LIMIT_OF_ARMOR);
  }

  public get Gender() {
    return this.gender;
  }

  public set Gender(gender: CharacterGender) {
    this.gender = gender;
  }

  public get ChainLocked() {
    return this.chainLocked;
  }
  public set ChainLocked(locked: boolean) {
    this.chainLocked = locked;
  }

  public get Nationality() {
    return Precondition.exists(this.nationality, 'Uninitialized nationality');
  }
  public set Nationality(nationality: CharacterNationality) {
    this.nationality = nationality;
  }

  public get MaxHp() {
    return this.maxHp;
  }
  public set MaxHp(maxHp: number) {
    this.maxHp = maxHp;
    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
  }

  public get LostHp() {
    return this.maxHp - Math.max(this.hp, 0);
  }

  public get Role() {
    return this.playerRole;
  }
  public set Role(role: PlayerRole) {
    this.playerRole = role;
  }

  public set CharacterId(characterId: CharacterId | undefined) {
    if (characterId === undefined) {
      return;
    }

    const hasCharacterId = this.playerCharacterId;

    this.playerCharacterId = characterId;
    this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
    hasCharacterId ||
      (this.playerSkills = this.playerCharacter.Skills.filter(skill =>
        skill.isLordSkill() ? this.playerRole === PlayerRole.Lord : true,
      ));

    this.Armor = this.playerCharacter.Armor;
    this.hp = this.playerCharacter.Hp;
    this.maxHp = this.playerCharacter.MaxHp;
    this.nationality = this.playerCharacter.Nationality;
    this.gender = this.playerCharacter.Gender;
  }
  public get CharacterId(): CharacterId | undefined {
    return this.playerCharacterId;
  }

  public get Character(): Character {
    return Precondition.alarm(this.playerCharacter, 'Uninitialized player character');
  }

  public get Id() {
    return this.playerId;
  }

  public get Name() {
    return this.playerName;
  }

  public get Position() {
    return this.playerPosition;
  }
  public set Position(position: number) {
    this.playerPosition = position;
  }

  public get HookedSkills() {
    return this.hookedSkills;
  }

  public get CardUseHistory() {
    return this.cardUseHistory;
  }

  public get SkillUsedHistory() {
    return this.skillUsedHistory;
  }

  public get Dead() {
    return this.dead;
  }

  public set Dying(dying: boolean) {
    this.dying = dying;
  }
  public get Dying() {
    return this.dying;
  }

  public bury() {
    this.turnedOver = false;
    this.chainLocked = false;
    this.huashenInfo = undefined;
    this.clearHeaded();
    this.dead = true;
  }

  public revive() {
    Precondition.assert(this.Hp > 0, 'Revive can only use for player who dead and Hp > 0');
    this.dead = false;
  }

  public getPlayerInfo(): PlayerInfo {
    const flags = {};
    for (const [key, value] of Object.entries(this.flags)) {
      flags[key] = {
        value,
        visiblePlayers: this.visiblePlayers[key],
      };
    }

    return {
      Id: this.playerId,
      Name: this.playerName,
      Position: this.playerPosition,
      Nationality: this.playerCharacterId != null ? this.Nationality : undefined,
      CharacterId: this.playerCharacterId,
      Role: this.playerRole,
      Hp: this.hp,
      MaxHp: this.maxHp,
      Status: this.status,
      Flags: flags,
      Marks: this.marks,
      Armor: this.armor,
    };
  }

  public getPlayerShortcutInfo(): PlayerShortcutInfo {
    const flags = {};
    for (const [key, value] of Object.entries(this.flags)) {
      flags[key] = {
        value,
        visiblePlayers: this.visiblePlayers[key],
      };
    }

    return {
      Id: this.playerId,
      Name: this.playerName,
      Position: this.playerPosition,
      Nationality: this.playerCharacterId != null ? this.Nationality : undefined,
      CharacterId: this.playerCharacterId,
      Role: this.playerRole,
      Hp: this.hp,
      MaxHp: this.maxHp,
      Status: this.status,
      Flags: flags,
      Marks: this.marks,
      Armor: this.armor,
      chainLocked: this.chainLocked,
      drunk: this.drunk,
      turnedOver: this.turnedOver,
      equipSectionsStatus: this.equipSectionsStatus,
      judgeAreaStatus: this.judgeAreaStatus,
      playerOutsideCharactersAreaNames: this.playerOutsideCharactersAreaNames,
      playerCards: this.playerCards,
      playerOutsideCards: this.playerOutsideCards,
      dead: this.dead,
    };
  }

  public get DisabledEquipSections(): CharacterEquipSections[] {
    return (Object.keys(this.equipSectionsStatus) as CharacterEquipSections[]).filter(
      section => this.equipSectionsStatus[section] === 'disabled',
    );
  }

  public get AvailableEquipSections(): CharacterEquipSections[] {
    return (Object.keys(this.equipSectionsStatus) as CharacterEquipSections[]).filter(
      section => this.equipSectionsStatus[section] === 'enabled',
    );
  }

  public abortEquipSections(...abortSections: CharacterEquipSections[]) {
    for (const section of abortSections) {
      this.equipSectionsStatus[section] = 'disabled';
    }
  }

  public resumeEquipSections(...abortSections: CharacterEquipSections[]) {
    for (const section of abortSections) {
      this.equipSectionsStatus[section] = 'enabled';
    }
  }

  public judgeAreaDisabled(): boolean {
    return this.judgeAreaStatus === 'disabled';
  }

  public abortJudgeArea() {
    this.judgeAreaStatus = 'disabled';
  }

  public resumeJudgeArea() {
    this.judgeAreaStatus = 'enabled';
  }

  setHuaShenInfo(info: HuaShenInfo) {
    this.huashenInfo = info;
  }
  getHuaShenInfo() {
    return this.huashenInfo;
  }

  public setOffline(quit?: boolean) {
    this.status = quit ? PlayerStatus.Quit : PlayerStatus.Offline;
  }
  public setOnline() {
    this.status = PlayerStatus.Online;
  }

  public isOnline() {
    return this.status === PlayerStatus.Online || this.status === PlayerStatus.Trusted;
  }

  public get AI() {
    return this.ai;
  }

  public isSmartAI() {
    return this.status === PlayerStatus.SmartAI;
  }

  public delegateOnSmartAI() {
    this.status = PlayerStatus.SmartAI;
  }

  public delegateOnTrusted(trusted: boolean) {
    this.status = trusted ? PlayerStatus.Trusted : PlayerStatus.Online;
  }

  public isTrusted() {
    return this.status === PlayerStatus.Trusted;
  }

  public get Status() {
    return this.status;
  }

  public getReady() {
    this.ready = true;
  }

  public isReady() {
    return this.ready;
  }
}
