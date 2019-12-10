import { CardId } from 'core/cards/card';
import { EquipCard, RideCard, WeaponCard } from 'core/cards/equip_card';
import {
  Character,
  CharacterId,
  CharacterNationality,
} from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import {
  PlayerCards,
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
  PlayerRole,
} from 'core/player/player_props';
import { DistanceSkill } from 'core/skills/skill';
import { Languages } from 'translations/languages';

export abstract class Player implements PlayerInfo {
  private hp: number;
  private maxHp: number;
  protected abstract playerId: PlayerId;
  protected abstract playerName: string;
  protected abstract playerLanguage: Languages;
  protected abstract playerPosition: number;
  protected playerRole: PlayerRole = PlayerRole.Unknown;
  protected nationality: CharacterNationality;
  protected distanceToOthers: number = 0;
  protected distanceFromOthers: number = 0;
  protected position: number;

  private playerCharacter: Character;

  constructor(
    protected playerCharacterId: CharacterId,
    protected playerCards?: PlayerCards,
  ) {
    this.playerCards = this.playerCards || {
      [PlayerCardsArea.HandArea]: [],
      [PlayerCardsArea.JudgeArea]: [],
      [PlayerCardsArea.HoldingArea]: [],
      [PlayerCardsArea.EquipArea]: [],
    };

    this.playerCharacter = Sanguosha.getCharacterById(this.playerCharacterId);
    this.hp = this.playerCharacter.MaxHp;
    this.maxHp = this.playerCharacter.MaxHp;
    this.nationality = this.playerCharacter.Nationality;
  }

  public getCardIds(area?: PlayerCardsArea): CardId[] {
    if (area === undefined) {
      const [handCards, judgeCards, holdingCards, equipCards] = Object.values(
        this.playerCards,
      );
      return [...handCards, ...judgeCards, ...holdingCards, ...equipCards];
    }

    return this.playerCards[area];
  }

  public getCardId(cardId: CardId): CardId | undefined {
    for (const cards of Object.values(this.playerCards)) {
      const targetCard = cards.find(card => card === cardId);
      if (targetCard !== undefined) {
        return targetCard;
      }
    }
  }

  public cardFrom(cardId: CardId): PlayerCardsArea | undefined {
    for (const [area, cards] of Object.entries(this.playerCards)) {
      if (cards.find(card => card === cardId)) {
        return (area as any) as PlayerCardsArea;
      }
    }
  }

  public drawCardIds(...cards: CardId[]) {
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
    let droppedCardIds: CardId[] = [];
    for (const playerCardsArea of playerCardsAreas) {
      const areaCards = this.getCardIds(playerCardsArea);
      for (const card of cards) {
        const index = areaCards.findIndex(areaCard => areaCard === card);
        if (index >= 0) {
          droppedCardIds = droppedCardIds.concat(areaCards.splice(index, 1)[0]);
        }
      }
    }

    return droppedCardIds;
  }

  public equip(equipCard: EquipCard) {
    const currentEquipIndex = this.playerCards[
      PlayerCardsArea.EquipArea
    ].findIndex(
      card =>
        Sanguosha.getCardById<EquipCard>(card).EqupCategory ===
        equipCard.EqupCategory,
    );

    if (currentEquipIndex >= 0) {
      this.playerCards[PlayerCardsArea.EquipArea].splice(currentEquipIndex, 1);
    }

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard.Id);
  }

  public hasArmored(card: CardId): boolean {
    return this.playerCards[PlayerCardsArea.EquipArea].includes(card);
  }

  public attackDistance() {
    let defaultDistance = 1;
    const weapon = this.playerCards[PlayerCardsArea.EquipArea].find(
      card => Sanguosha.getCardById(card) instanceof WeaponCard,
    );
    if (weapon !== undefined) {
      const weaponCard: WeaponCard = Sanguosha.getCardById(weapon);
      defaultDistance += weaponCard.AttackDistance;
    }

    return defaultDistance;
  }

  public inDistanceTo(target: Player): boolean {
    const fixedDistance = this.getFixedDistance(true);
    const targetFixedDistance = target.getFixedDistance(false);

    return (this.position + fixedDistance) - (target.position + targetFixedDistance) <= 1;
  }

  public inDistanceFrom(source: Player): boolean {
    const fixedDistance = this.getFixedDistance(false);
    const sourceFixedDistance = source.getFixedDistance(true);

    return (source.position + sourceFixedDistance) - (this.position + fixedDistance) <= 1;
  }

  private getFixedDistance(toOthers: boolean) {
    const rides: DistanceSkill[] = this.playerCharacter[
      PlayerCardsArea.EquipArea
    ]
      .filter(cardId => {
        const card = Sanguosha.getCardById(cardId);
        return card instanceof RideCard;
      })
      .map(cardId => Sanguosha.getCardById<RideCard>(cardId).ActualSkill);

    const skills: DistanceSkill[] = this.playerCharacter.Skills.filter(
      skill => skill instanceof DistanceSkill,
    ) as DistanceSkill[];

    let fixedDistance = 0;
    for (const skill of [...rides, ...skills]) {
      if (toOthers) {
        if (skill.Distance < 0) {
          fixedDistance += skill.Distance;
        }
      } else {
        if (skill.Distance > 0) {
          fixedDistance += skill.Distance;
        }
      }
    }

    return fixedDistance;
  }

  public onDamage(hit: number) {
    this.hp -= hit;
  }

  public onLoseHp(lostHp: number) {
    this.hp -= lostHp;
  }

  public get Hp() {
    return this.hp;
  }

  public get Nationality() {
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
    return this.playerCharacterId;
  }

  public get Character() {
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

  public get PlayerLanguage() {
    return this.playerLanguage;
  }

  public set PlayerLanguage(language: Languages) {
    this.playerLanguage = language;
  }
}
