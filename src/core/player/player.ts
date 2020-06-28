import { PlayerAI } from 'core/ai/ai';
import { TrustAI } from 'core/ai/trust_ai';
import { Card, CardType, VirtualCard } from 'core/cards/card';
import { EquipCard, WeaponCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterGender, CharacterId, CharacterNationality } from 'core/characters/character';
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
import { Precondition } from 'core/shares/libs/precondition/precondition';
import {
  ActiveSkill,
  FilterSkill,
  GlobalFilterSkill,
  RulesBreakerSkill,
  Skill,
  SkillType,
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
  | 'complusory'
  | 'active'
  | 'filter'
  | 'globalFilter'
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
  private gender: CharacterGender;
  private online: boolean;
  private ai: PlayerAI = TrustAI.Instance;

  private drunk: number = 0;

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
      this.gender = this.playerCharacter.Gender;
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
  getAllFlags() {
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
  getAllMarks() {
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

  public canUseCard(room: Room, cardId: CardId | CardMatcher, onResponse?: CardMatcher): boolean {
    const card = cardId instanceof CardMatcher ? undefined : Sanguosha.getCardById(cardId);
    const ruleCardUse = GameCommonRules.canUse(
      room,
      this,
      cardId instanceof CardMatcher ? cardId : Sanguosha.getCardById(cardId),
    );

    if (card) {
      return (
        ruleCardUse &&
        (card.is(CardType.Equip) ? true : onResponse ? onResponse.match(card) : card.Skill.canUse(room, this))
      );
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
    this.skillUsedHistory[skillName] !== undefined
      ? this.skillUsedHistory[skillName]++
      : (this.skillUsedHistory[skillName] = 1);
  }

  public getCardIds(area?: PlayerCardsArea, outsideAreaName?: string): CardId[] {
    if (area === undefined) {
      const [handCards, judgeCards, equipCards] = Object.values<CardId[]>(this.playerCards);
      return [...handCards, ...judgeCards, ...equipCards];
    }

    if (area !== PlayerCardsArea.OutsideArea) {
      return this.playerCards[area];
    } else {
      outsideAreaName = Precondition.exists(outsideAreaName, `Unable to get ${outsideAreaName} area cards`);
      this.playerOutsideCards[outsideAreaName] = this.playerOutsideCards[outsideAreaName] || [];
      return this.playerOutsideCards[outsideAreaName];
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
    const realCardId = Card.getActualCards([cardId]);
    if (realCardId.length > 1) {
      return;
    } else {
      cardId = realCardId[0];
    }

    for (const [area, cards] of Object.entries(this.playerCards) as [string, CardId[]][]) {
      const realCards = Card.getActualCards(cards);
      if (realCards.find(card => card === cardId)) {
        return parseInt(area, 10) as PlayerCardsArea;
      }
    }
  }

  public obtainCardIds(...cards: CardId[]) {
    const handCards = this.getCardIds(PlayerCardsArea.HandArea);
    for (const card of Card.getActualCards(cards)) {
      handCards.push(card);
    }
  }

  dropCards(...cards: CardId[]): CardId[] {
    const droppedCardIds: CardId[] = [];
    const allCards = this.getCardIds();
    const droppingCards = cards.reduce<CardId[]>((dropping, card) => {
      if (!allCards.includes(card) && Card.isVirtualCardId(card)) {
        dropping.push(...Card.getActualCards([card]));
      } else {
        dropping.push(card);
      }
      return dropping;
    }, []);

    for (const area of [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea, PlayerCardsArea.JudgeArea]) {
      const areaCards = this.getCardIds(area);
      for (const card of droppingCards) {
        let index = areaCards.findIndex(areaCard => areaCard === card);
        if (index >= 0) {
          droppedCardIds.push(areaCards.splice(index, 1)[0]);
        } else {
          for (const outsideArea of Object.values(this.playerOutsideCards)) {
            index = outsideArea.findIndex(areaCard => areaCard === card);
            if (index >= 0) {
              droppedCardIds.push(outsideArea.splice(index, 1)[0]);
            }
          }
        }
      }
    }

    const untrackedCards = droppingCards.filter(card => !droppedCardIds.includes(card));
    if (untrackedCards.length > 0) {
      throw new Error(`Can't drop card ${JSON.stringify(untrackedCards)} from player ${this.Name}`);
    }

    return droppedCardIds;
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

  public getDrunk() {
    this.drunk++;
  }
  public hasDrunk() {
    return this.drunk;
  }
  public clearHeaded() {
    this.drunk = 0;
  }

  public canUseCardTo(room: Room, cardId: CardId | CardMatcher, target: PlayerId): boolean {
    const player = room.getPlayerById(target);

    for (const skill of player.getSkills<FilterSkill>('filter')) {
      if (!skill.canBeUsedCard(cardId, room, target, this.Id)) {
        return false;
      }
    }
    for (const skill of this.getSkills<FilterSkill>('filter')) {
      if (!skill.canUseCard(cardId, room, this.Id, target)) {
        return false;
      }
    }

    return true;
  }

  public getEquipment(cardType: CardType): CardId | undefined {
    return this.playerCards[PlayerCardsArea.EquipArea].find(cardId => Sanguosha.getCardById(cardId).is(cardType));
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
        const viewAsCards = skill.canViewAs(room, this);
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
      const skill = this.getSkills<ViewAsSkill>('viewAs').find(skill => skill.canViewAs(room, this).includes(card.GeneralName));

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
    return this.skillUsedHistory[skillName] && this.skillUsedHistory[skillName] > 0;
  }
  public hasUsedSkillTimes(skillName: string): number {
    return this.skillUsedHistory[skillName] === undefined ? 0 : this.skillUsedHistory[skillName];
  }

  public getAttackDistance(room: Room) {
    return Math.max(this.getOffenseDistance(room) + this.getAttackRange(room), 1);
  }

  public getAttackRange(room: Room) {
    let attackDistance = 0;
    for (const cardId of this.getCardIds(PlayerCardsArea.EquipArea)) {
      const card = Card.isVirtualCardId(cardId)
        ? Sanguosha.getCardById<VirtualCard<WeaponCard>>(cardId).ViewAsCard
        : Sanguosha.getCardById(cardId);

      if (card instanceof WeaponCard) {
        attackDistance += card.AttackDistance;
      }
    }

    return attackDistance + GameCommonRules.getAdditionalAttackDistance(this);
  }

  public getOffenseDistance(room: Room) {
    return GameCommonRules.getAdditionalOffenseDistance(room, this);
  }

  public getDefenseDistance(room: Room) {
    return GameCommonRules.getAdditionalDefenseDistance(room, this);
  }

  public getCardUsableDistance(room: Room, cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return card.EffectUseDistance + GameCommonRules.getCardAdditionalUsableDistance(room, this, card);
  }

  public getCardAdditionalUsableNumberOfTargets(room: Room, cardId: CardId | CardMatcher) {
    const card = cardId instanceof CardMatcher ? cardId : Sanguosha.getCardById(cardId);
    return GameCommonRules.getCardAdditionalNumberOfTargets(room, this, card);
  }

  public getEquipSkills<T extends Skill = Skill>(skillType?: SkillStringType) {
    const equipCards = this.playerCards[PlayerCardsArea.EquipArea].map(card => Sanguosha.getCardById(card));
    const skills = equipCards.map(card => card.Skill);
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
      case 'complusory':
        return skills.filter(skill => skill.SkillType === SkillType.Compulsory) as T[];
      case 'awaken':
        return skills.filter(skill => skill.SkillType === SkillType.Awaken) as T[];
      case 'limit':
        return skills.filter(skill => skill.SkillType === SkillType.Limit) as T[];
      case 'common':
        return skills.filter(skill => skill.SkillType === SkillType.Common) as T[];
      case 'transform':
        return skills.filter(skill => skill instanceof TransformSkill) as T[];
      default:
        throw Precondition.UnreachableError(skillType);
    }
  }

  public getPlayerSkills<T extends Skill = Skill>(skillType?: SkillStringType, includeDisabled?: boolean): T[] {
    Precondition.assert(
      this.playerCharacter !== undefined,
      `Player ${this.playerName} has not been initialized with a character yet`,
    );

    const skills = this.playerSkills.filter(skill => includeDisabled || !UniqueSkillRule.isProhibited(skill, this));
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
      case 'transform':
        return skills.filter(skill => skill instanceof TransformSkill) as T[];
      case 'complusory':
        return skills.filter(skill => skill.SkillType === SkillType.Compulsory) as T[];
      case 'awaken':
        return skills.filter(skill => skill.SkillType === SkillType.Awaken) as T[];
      case 'limit':
        return skills.filter(skill => skill.SkillType === SkillType.Limit) as T[];
      case 'common':
        return skills.filter(skill => skill.SkillType === SkillType.Common) as T[];
      default:
        throw Precondition.UnreachableError(skillType);
    }
  }

  public getSkills<T extends Skill = Skill>(skillType?: SkillStringType): T[] {
    return [...this.getEquipSkills<T>(skillType), ...this.getPlayerSkills<T>(skillType)];
  }

  public loseSkill(skillName: string) {
    const lostSkill: Skill[] = [];
    const existSkill: Skill[] = [];
    for (const skill of this.playerSkills) {
      if (skill.Name.endsWith(skillName)) {
        lostSkill.push(skill);
      } else {
        existSkill.push(skill);
      }
    }

    this.playerSkills = existSkill;
    return lostSkill;
  }

  public obtainSkill(skillName: string) {
    const skill = Sanguosha.getSkillBySkillName(skillName);
    if (this.playerSkills.includes(skill)) {
      return;
    }

    this.playerSkills.push(skill);
    for (const shadowSkill of Sanguosha.getShadowSkillsBySkillName(skillName)) {
      this.playerSkills.push(shadowSkill);
    }
  }

  public addSkill(skill: Skill) {
    this.playerSkills.push(skill);
  }
  public removeSkill(skill: Skill) {
    this.playerSkills = this.playerSkills.filter(existSkill => existSkill !== skill);
  }

  public hasSkill(skillName: string) {
    return this.playerSkills.find(skill => skill.Name === skillName) !== undefined;
  }

  public hasShadowSkill(skillName: string) {
    return this.playerSkills.find(skill => skill.Name.startsWith('#') && skill.Name.endsWith(skillName)) !== undefined;
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

  public get Hp() {
    return this.hp;
  }
  public set Hp(hp: number) {
    this.hp = hp;
  }

  public get Gender() {
    return this.gender;
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

    this.hp = this.playerCharacter.Hp;
    this.maxHp = this.playerCharacter.MaxHp;
    this.nationality = this.playerCharacter.Nationality;
    this.gender = this.playerCharacter.Gender;
  }
  public get CharacterId(): CharacterId | undefined {
    return this.playerCharacterId;
  }

  public get Character(): Character {
    return Precondition.exists(this.playerCharacter, 'Uninitialized player character');
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

  public bury() {
    this.turnedOver = false;
    this.chainLocked = false;
    this.clearHeaded();
    this.dead = true;
  }

  public getPlayerInfo(): PlayerInfo {
    return {
      Id: this.playerId,
      Name: this.playerName,
      Position: this.playerPosition,
      CharacterId: this.playerCharacterId,
      Role: this.playerRole,
      Hp: this.hp,
      MaxHp: this.maxHp,
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
