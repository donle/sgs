import { EquipCard, RideCard, WeaponCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  Character,
  CharacterId,
  CharacterNationality,
} from 'core/characters/character';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import {
  PlayerCards,
  PlayerCardsArea,
  PlayerCardsOutside,
  PlayerId,
  PlayerInfo,
  PlayerRole,
} from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  FilterSkill,
  RulesBreakerSkill,
  Skill,
  SkillType,
  TriggerSkill,
} from 'core/skills/skill';

type SkillSytingType =
  | 'trigger'
  | 'common'
  | 'limit'
  | 'awaken'
  | 'complusory'
  | 'active'
  | 'filter'
  | 'breaker';

export abstract class Player implements PlayerInfo {
  private hp: number;
  private maxHp: number;
  private dead: boolean;
  private chainLocked: boolean = false;
  private turnedOver: boolean = false;

  protected abstract playerId: PlayerId;
  protected abstract playerName: string;
  protected abstract playerPosition: number;
  protected playerRole: PlayerRole = PlayerRole.Unknown;
  protected nationality: CharacterNationality;
  protected position: number = -1;

  private cardUseHistory: CardId[] = [];
  private skillUsedHistory: {
    [K: string]: number;
  }[] = [];
  private playerCharacter: Character | undefined;
  protected playerCards: PlayerCards & PlayerCardsOutside;

  private flags: {
    [k: string]: any;
  } = {};
  private marks: {
    [markName: string]: number;
  } = {};

  constructor(
    playerCards?: PlayerCards & PlayerCardsOutside,
    protected playerCharacterId?: CharacterId,
  ) {
    this.playerCards = playerCards || {
      [PlayerCardsArea.HandArea]: [],
      [PlayerCardsArea.JudgeArea]: [],
      [PlayerCardsArea.HoldingArea]: [],
      [PlayerCardsArea.EquipArea]: [],
      [PlayerCardsArea.OutsideArea]: {},
    };

    if (this.playerCharacterId) {
      this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
      this.hp = this.playerCharacter.MaxHp;
      this.maxHp = this.playerCharacter.MaxHp;
      this.nationality = this.playerCharacter.Nationality;
    }

    this.dead = false;
  }

  public clearFlags() {
    this.flags = {};
  }
  removeFlag(name: string) {
    delete this.flags[name];
  }
  setFlag<T>(name: string, value: T): T {
    return (this.flags[name] = value);
  }
  getFlag<T>(name: string): T {
    return this.flags[name];
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
      this.marks[name] = 0;
    }
    return (this.marks[name] += value);
  }
  getMark(name: string) {
    return this.marks[name];
  }
  addInvisibleMark(name: string, value: number) {
    return this.addMark('#' + name, value);
  }
  getInvisibleMark(name: string) {
    return this.marks['#' + name];
  }
  removeInvisibleMark(name: string) {
    delete this.marks['#' + name];
  }

  public canUseCardTo(
    room: Room,
    cardId: CardId | CardMatcher,
    target: PlayerId,
  ): boolean {
    const player = room.getPlayerById(target);

    const skills = player.getSkills<FilterSkill>('filter');
    for (const skill of skills) {
      if (!skill.canBeUsedCard(cardId, room, target)) {
        return false;
      }
    }

    return true;
  }

  public canUseCard(room: Room, cardId: CardId | CardMatcher): boolean {
    const card =
      cardId instanceof CardMatcher ? undefined : Sanguosha.getCardById(cardId);
    const ruleCardUse = GameCommonRules.canUse(
      this,
      cardId instanceof CardMatcher ? cardId : Sanguosha.getCardById(cardId),
    );

    if (card) {
      return ruleCardUse && card.Skill.canUse(room, this);
    }

    return ruleCardUse;
  }

  public resetCardUseHistory() {
    this.cardUseHistory = [];
  }

  public useCard(cardId: CardId) {
    this.cardUseHistory.push(cardId);
  }
  public useSkill(skillName: string) {
    this.skillUsedHistory[skillName] !== undefined
      ? this.skillUsedHistory[skillName]++
      : (this.skillUsedHistory[skillName] = 0);
  }

  public getCardIds(
    area?: PlayerCardsArea,
    outsideAreaName?: string,
  ): CardId[] {
    if (area === undefined) {
      const [handCards, judgeCards, holdingCards, equipCards] = Object.values(
        this.playerCards,
      );
      return [...handCards, ...judgeCards, ...holdingCards, ...equipCards];
    }

    if (area !== PlayerCardsArea.OutsideArea) {
      return this.playerCards[area];
    } else {
      if (outsideAreaName === undefined) {
        throw new Error('Unable to get undefined area cards');
      }

      return this.playerCards[area][outsideAreaName];
    }
  }

  public getCardId(cardId: CardId): CardId | undefined {
    for (const card of Object.values(this.getCardIds())) {
      if (card === cardId) {
        return cardId;
      }
    }
  }

  public cardFrom(cardId: CardId): PlayerCardsArea | undefined {
    const {
      [PlayerCardsArea.OutsideArea]: cards,
      ...playerCardsInGame
    } = this.playerCards;

    for (const [area, cards] of Object.entries(playerCardsInGame) as [
      string,
      CardId[],
    ][]) {
      if (cards.find(card => card === cardId)) {
        return (area as any) as PlayerCardsArea;
      }
    }
  }

  public obtainCardIds(...cards: CardId[]) {
    const handCards = this.getCardIds(PlayerCardsArea.HandArea);
    for (const card of cards) {
      handCards.push(card);
    }
  }

  dropCards(...cards: CardId[]): CardId[] {
    const playerCardsAreas = [
      PlayerCardsArea.EquipArea,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HoldingArea,
      PlayerCardsArea.JudgeArea,
    ];
    const droppedCardIds: CardId[] = [];
    for (const playerCardsArea of playerCardsAreas) {
      const areaCards = this.getCardIds(playerCardsArea);
      for (const card of cards) {
        const index = areaCards.findIndex(areaCard => areaCard === card);
        if (index >= 0) {
          droppedCardIds.push(areaCards.splice(index, 1)[0]);
        }
      }
    }

    return droppedCardIds;
  }

  public equip(equipCard: EquipCard) {
    const currentEquipIndex = this.playerCards[
      PlayerCardsArea.EquipArea
    ].findIndex(card =>
      Sanguosha.getCardById<EquipCard>(card).isSameType(equipCard),
    );

    let lostEquipId: CardId | undefined;
    if (currentEquipIndex >= 0) {
      lostEquipId = this.playerCards[PlayerCardsArea.EquipArea].splice(
        currentEquipIndex,
        1,
      )[0] as CardId;
    }

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard.Id);

    return lostEquipId;
  }

  public hasEquipped(cardId: CardId): boolean {
    return this.playerCards[PlayerCardsArea.EquipArea].includes(cardId);
  }

  public hasUsed(cardName: string): boolean {
    return (
      this.cardUseHistory.find(
        cardId => Sanguosha.getCardById(cardId).Name === cardName,
      ) !== undefined
    );
  }
  public cardUsedTimes(cardSkillName: CardId | CardMatcher): number {
    return this.cardUseHistory.filter(cardId => {
      const card = Sanguosha.getCardById(cardId);
      return cardSkillName instanceof CardMatcher
        ? cardSkillName.match(card)
        : card.GeneralName === cardSkillName;
    }).length;
  }

  public hasUsedSkill(skillName: string): boolean {
    return (
      this.skillUsedHistory[skillName] && this.skillUsedHistory[skillName] > 0
    );
  }
  public hasUsedSkillTimes(skillName: string): number {
    return this.skillUsedHistory[skillName] === undefined
      ? 0
      : this.skillUsedHistory[skillName];
  }

  public get AttackDistance() {
    let attackDistance = this.getOffenseDistance();

    for (const cardId of this.getCardIds(PlayerCardsArea.EquipArea)) {
      const card = Sanguosha.getCardById(cardId);
      if (card instanceof WeaponCard) {
        attackDistance += card.AttackDistance;
      }
    }

    return attackDistance + GameCommonRules.getAdditionalAttackDistance(this);
  }

  public getOffenseDistance() {
    return GameCommonRules.getAdditionalOffenseDistance(this) + 1;
  }

  public getDefenseDistance() {
    return GameCommonRules.getAdditionalDefenseDistance(this);
  }

  public getCardUsableDistance(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return (
      card.EffectUseDistance +
      GameCommonRules.getCardAdditionalUsableDistance(card, this)
    );
  }

  public getCardAdditionalUsableNumberOfTargets(cardId: CardId | CardMatcher) {
    const card =
      cardId instanceof CardMatcher ? cardId : Sanguosha.getCardById(cardId);
    return GameCommonRules.getCardAdditionalNumberOfTargets(card, this);
  }

  public getEquipSkills<T extends Skill = Skill>(skillType?: SkillSytingType) {
    if (!this.playerCharacter) {
      throw new Error(
        `Player ${this.playerName} has not been initialized with a character yet`,
      );
    }

    const equipCards = this.playerCards[PlayerCardsArea.EquipArea].map(card =>
      Sanguosha.getCardById(card),
    );
    const skills = equipCards.map(card => card.Skill);
    if (skillType === undefined) {
      return skills as T[];
    }

    switch (skillType) {
      case 'filter':
        return skills.filter(skill => skill instanceof FilterSkill) as T[];
      case 'active':
        return skills.filter(skill => skill instanceof ActiveSkill) as T[];
      case 'trigger':
        return skills.filter(skill => skill instanceof TriggerSkill) as T[];
      case 'breaker':
        return skills.filter(
          skill => skill instanceof RulesBreakerSkill,
        ) as T[];
      case 'complusory':
        return skills.filter(
          skill => skill.SkillType === SkillType.Compulsory,
        ) as T[];
      case 'awaken':
        return skills.filter(
          skill => skill.SkillType === SkillType.Awaken,
        ) as T[];
      case 'limit':
        return skills.filter(
          skill => skill.SkillType === SkillType.Limit,
        ) as T[];
      case 'common':
        return skills.filter(
          skill => skill.SkillType === SkillType.Common,
        ) as T[];
      default:
        throw new Error(`Unreachable error of skill type: ${skillType}`);
    }
  }

  public getPlayerSkills<T extends Skill = Skill>(
    skillType?: SkillSytingType,
  ): T[] {
    if (!this.playerCharacter) {
      throw new Error(
        `Player ${this.playerName} has not been initialized with a character yet`,
      );
    }

    const skills = this.playerCharacter.Skills;
    if (skillType === undefined) {
      return skills as T[];
    }

    switch (skillType) {
      case 'filter':
        return skills.filter(skill => skill instanceof FilterSkill) as T[];
      case 'active':
        return skills.filter(skill => skill instanceof ActiveSkill) as T[];
      case 'trigger':
        return skills.filter(skill => skill instanceof TriggerSkill) as T[];
      case 'breaker':
        return skills.filter(
          skill => skill instanceof RulesBreakerSkill,
        ) as T[];
      case 'complusory':
        return skills.filter(
          skill => skill.SkillType === SkillType.Compulsory,
        ) as T[];
      case 'awaken':
        return skills.filter(
          skill => skill.SkillType === SkillType.Awaken,
        ) as T[];
      case 'limit':
        return skills.filter(
          skill => skill.SkillType === SkillType.Limit,
        ) as T[];
      case 'common':
        return skills.filter(
          skill => skill.SkillType === SkillType.Common,
        ) as T[];
      default:
        throw new Error(`Unreachable error of skill type: ${skillType}`);
    }
  }

  public getSkills<T extends Skill = Skill>(skillType?: SkillSytingType): T[] {
    return [
      ...this.getEquipSkills<T>(skillType),
      ...this.getPlayerSkills<T>(skillType),
    ];
  }

  public turnOver() {
    this.turnedOver = !this.turnedOver;
  }

  public onDamage(hit: number) {
    this.hp -= hit;
  }

  public onLoseHp(lostHp: number) {
    this.hp -= lostHp;
  }

  public onRecoverHp(recover: number) {
    this.hp += recover;
  }

  public get Hp() {
    return this.hp;
  }

  public get ChainLocked() {
    return this.chainLocked;
  }
  public set ChainLocked(locked: boolean) {
    this.chainLocked = locked;
  }

  public get Nationality() {
    if (this.nationality === undefined) {
      throw new Error('Uninitialized nationality');
    }
    return this.nationality;
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

  public get Role() {
    return this.playerRole;
  }
  public set Role(role: PlayerRole) {
    this.playerRole = role;
  }

  public set CharacterId(characterId: CharacterId) {
    this.playerCharacterId = characterId;
  }
  public get CharacterId() {
    if (this.playerCharacterId === undefined) {
      throw new Error('No player character id initialized');
    }
    return this.playerCharacterId;
  }

  public get Character() {
    if (this.playerCharacter === undefined) {
      throw new Error('No player character initialized');
    }
    return this.playerCharacter;
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

  public get CardUseHistory() {
    return this.cardUseHistory;
  }

  public get Dead() {
    return this.dead;
  }
}
