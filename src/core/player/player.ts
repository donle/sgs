import { PlayerAI } from 'core/ai/ai';
import { CardType } from 'core/cards/card';
import { EquipCard, WeaponCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  Character,
  CharacterId,
  CharacterNationality,
} from 'core/characters/character';
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
  TransformSkill,
  TriggerSkill,
  ViewAsSkill,
} from 'core/skills/skill';

type SkillStringType =
  | 'trigger'
  | 'common'
  | 'limit'
  | 'awaken'
  | 'complusory'
  | 'active'
  | 'filter'
  | 'breaker'
  | 'transform'
  | 'viewAs';

export abstract class Player implements PlayerInfo {
  private hp: number;
  private maxHp: number;
  private dead: boolean;
  private chainLocked: boolean = false;
  private turnedOver: boolean = false;
  private playerSkills: Skill[] = [];
  private online: boolean;
  private ai: PlayerAI = PlayerAI.Instance;

  protected abstract playerId: PlayerId;
  protected abstract playerName: string;
  protected abstract playerPosition: number;
  protected playerRole: PlayerRole = PlayerRole.Unknown;
  protected nationality: CharacterNationality;

  private cardUseHistory: CardId[] = [];
  private skillUsedHistory: {
    [K: string]: number;
  }[] = [];
  private playerCharacter: Character | undefined;
  protected playerCards: PlayerCards;
  protected playerOutsideCards: PlayerCardsOutside;

  private flags: {
    [k: string]: any;
  } = {};
  private marks: {
    [markName: string]: number;
  } = {};

  constructor(
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
    protected playerCharacterId?: CharacterId,
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

    if (this.playerCharacterId) {
      this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
      this.hp = this.playerCharacter.MaxHp;
      this.maxHp = this.playerCharacter.MaxHp;
      this.nationality = this.playerCharacter.Nationality;
    }

    this.dead = false;
    this.online = true;

    GameCommonRules.initPlayerCommonRules(this);
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

  public resetSkillUseHistory(skillName: string) {
    this.skillUsedHistory[skillName] = 0;
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
      const [handCards, judgeCards, equipCards] = Object.values<CardId[]>(
        this.playerCards,
      );
      return [...handCards, ...judgeCards, ...equipCards];
    }

    if (area !== PlayerCardsArea.OutsideArea) {
      return this.playerCards[area];
    } else {
      if (outsideAreaName === undefined) {
        throw new Error('Unable to get undefined area cards');
      }

      return this.playerOutsideCards[outsideAreaName];
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
    for (const [area, cards] of Object.entries(this.playerCards) as [
      string,
      CardId[],
    ][]) {
      if (cards.find(card => card === cardId)) {
        return parseInt(area, 10) as PlayerCardsArea;
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
      PlayerCardsArea.JudgeArea,
    ];
    const droppedCardIds: CardId[] = [];
    let hasDropped = false;
    for (const playerCardsArea of playerCardsAreas) {
      const areaCards = this.getCardIds(playerCardsArea);
      for (const card of cards) {
        const index = areaCards.findIndex(areaCard => areaCard === card);
        if (index >= 0) {
          droppedCardIds.push(areaCards.splice(index, 1)[0]);
          hasDropped = true;
        }
      }
    }

    if (!hasDropped) {
      throw new Error(`Can't drop cards ${cards} from player ${this.Name}`);
    }

    return droppedCardIds;
  }

  public equip(equipCard: EquipCard) {
    const currentEquipIndex = this.playerCards[
      PlayerCardsArea.EquipArea
    ].findIndex(card =>
      Sanguosha.getCardById<EquipCard>(card).is(equipCard.EquipType),
    );
    let lostEquipId: CardId | undefined;
    if (currentEquipIndex >= 0) {
      lostEquipId = this.playerCards[PlayerCardsArea.EquipArea].splice(
        currentEquipIndex,
        1,
      )[0] as CardId;
    }

    const equipCardFromHandsIndex = this.playerCards[
      PlayerCardsArea.HandArea
    ].findIndex(cardId => equipCard.Id === cardId);
    if (equipCardFromHandsIndex >= 0) {
      this.playerCards[PlayerCardsArea.HandArea].splice(
        equipCardFromHandsIndex,
        1,
      );
    }

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard.Id);
    return lostEquipId;
  }

  public hasEquipment(cardType: CardType): CardId | undefined {
    return this.playerCards[PlayerCardsArea.EquipArea].find(cardId =>
      Sanguosha.getCardById(cardId).is(cardType),
    );
  }

  public hasCard(
    cardMatcherOrId: CardId | CardMatcher,
    areas?: PlayerCardsArea,
    outsideName?: string,
  ) {
    if (cardMatcherOrId instanceof CardMatcher) {
      const findCard = this.getCardIds(areas, outsideName).find(cardId => {
        const card = Sanguosha.getCardById(cardId);
        return cardMatcherOrId.match(card);
      });

      if (findCard) {
        return true;
      }

      const skill = this.getSkills<ViewAsSkill>('viewAs').find(skill => {
        const viewAsCards = skill.canViewAs();
        return CardMatcher.match(
          CardMatcher.addTag({ name: viewAsCards }),
          cardMatcherOrId,
        );
      });

      return !!skill;
    } else {
      if (this.getCardId(cardMatcherOrId)) {
        return true;
      }

      const card = Sanguosha.getCardById(cardMatcherOrId);
      const skill = this.getSkills<ViewAsSkill>('viewAs').find(skill =>
        skill.canViewAs().includes(card.GeneralName),
      );

      return !!skill;
    }
  }

  public hasUsed(cardName: string): boolean {
    return (
      this.cardUseHistory.find(
        cardId => Sanguosha.getCardById(cardId).Name === cardName,
      ) !== undefined
    );
  }
  public cardUsedTimes(cardSkillName: CardId | CardMatcher): number {
    const trendToUse =
      cardSkillName instanceof CardMatcher
        ? cardSkillName
        : Sanguosha.getCardById(cardSkillName);
    return this.cardUseHistory.filter(cardId => {
      const card = Sanguosha.getCardById(cardId);
      return trendToUse instanceof CardMatcher
        ? trendToUse.match(card)
        : card.GeneralName === trendToUse.GeneralName;
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
    let attackDistance = this.getOffenseDistance() + 1;

    for (const cardId of this.getCardIds(PlayerCardsArea.EquipArea)) {
      const card = Sanguosha.getCardById(cardId);
      if (card instanceof WeaponCard) {
        attackDistance += card.AttackDistance;
      }
    }

    return attackDistance + GameCommonRules.getAdditionalAttackDistance(this);
  }

  public getOffenseDistance() {
    return GameCommonRules.getAdditionalOffenseDistance(this);
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

  public getEquipSkills<T extends Skill = Skill>(skillType?: SkillStringType) {
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
      case 'viewAs':
        return skills.filter(skill => skill instanceof ViewAsSkill) as T[];
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
    skillType?: SkillStringType,
  ): T[] {
    if (!this.playerCharacter) {
      throw new Error(
        `Player ${this.playerName} has not been initialized with a character yet`,
      );
    }

    if (skillType === undefined) {
      return this.playerSkills as T[];
    }

    switch (skillType) {
      case 'filter':
        return this.playerSkills.filter(
          skill => skill instanceof FilterSkill,
        ) as T[];
      case 'viewAs':
        return this.playerSkills.filter(
          skill => skill instanceof ViewAsSkill,
        ) as T[];
      case 'active':
        return this.playerSkills.filter(
          skill => skill instanceof ActiveSkill,
        ) as T[];
      case 'trigger':
        return this.playerSkills.filter(
          skill => skill instanceof TriggerSkill,
        ) as T[];
      case 'breaker':
        return this.playerSkills.filter(
          skill => skill instanceof RulesBreakerSkill,
        ) as T[];
      case 'transform':
        return this.playerSkills.filter(
          skill => skill instanceof TransformSkill,
        ) as T[];
      case 'complusory':
        return this.playerSkills.filter(
          skill => skill.SkillType === SkillType.Compulsory,
        ) as T[];
      case 'awaken':
        return this.playerSkills.filter(
          skill => skill.SkillType === SkillType.Awaken,
        ) as T[];
      case 'limit':
        return this.playerSkills.filter(
          skill => skill.SkillType === SkillType.Limit,
        ) as T[];
      case 'common':
        return this.playerSkills.filter(
          skill => skill.SkillType === SkillType.Common,
        ) as T[];
      default:
        throw new Error(`Unreachable error of skill type: ${skillType}`);
    }
  }

  public getSkills<T extends Skill = Skill>(skillType?: SkillStringType): T[] {
    return [
      ...this.getEquipSkills<T>(skillType),
      ...this.getPlayerSkills<T>(skillType),
    ];
  }

  public loseSkill(skillName: string) {
    this.playerSkills.filter(skill => skill.Name !== skillName);
  }

  public obtainSkill(skillName: string) {
    this.playerSkills.push(Sanguosha.getSkillBySkillName(skillName));
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

  public set CharacterId(characterId: CharacterId | undefined) {
    if (characterId === undefined) {
      return;
    }

    if (this.playerCharacter !== undefined) {
      this.playerSkills = this.playerSkills.filter(skill => {
        if (this.playerCharacter!.Skills.includes(skill)) {
          skill.onLoseSkill(this);
          return false;
        }

        return true;
      });
    }

    this.playerCharacterId = characterId;
    this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
    this.playerSkills = this.playerCharacter.Skills.filter(skill =>
      skill.isLordSkill() ? this.playerRole === PlayerRole.Lord : true,
    );

    this.hp = this.playerCharacter.MaxHp;
    this.maxHp = this.playerCharacter.MaxHp;
  }
  public get CharacterId(): CharacterId | undefined {
    return this.playerCharacterId;
  }

  public get Character(): Character {
    if (this.playerCharacter === undefined) {
      throw new Error('Uninitialized player character');
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

  public getPlayerInfo(): PlayerInfo {
    return {
      Id: this.playerId,
      Name: this.playerName,
      Position: this.playerPosition,
      CharacterId: this.playerCharacterId,
      Role: this.playerRole,
    };
  }

  public offline() {
    this.online = false;
  }

  public isOnline() {
    return this.online;
  }

  public get AI() {
    return this.ai;
  }
}
