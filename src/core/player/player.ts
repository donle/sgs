import { Card, CardId, EquipCard } from 'core/cards/card';
import { Character, CharacterNationality } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import {
  PlayerCards,
  PlayerCardsArea,
  PlayerId,
  PlayerRole,
} from 'core/player/player_props';

export abstract class Player {
  private hp: number;
  private maxHp: number;
  protected abstract playerId: PlayerId;
  protected abstract playerName: string;
  protected playerRole: PlayerRole = PlayerRole.Unknown;
  protected nationality: CharacterNationality;

  constructor(
    protected playerCharacter: Character,
    protected playerCards?: PlayerCards,
  ) {
    this.playerCards = this.playerCards || {
      [PlayerCardsArea.HandArea]: [],
      [PlayerCardsArea.JudgeArea]: [],
      [PlayerCardsArea.HoldingArea]: [],
      [PlayerCardsArea.EquipArea]: [],
    };

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

  drawCardIds(...cards: CardId[]) {
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

  public equip(engine: Sanguosha, equipCard: EquipCard) {
    const currentEquipIndex = this.playerCards[
      PlayerCardsArea.EquipArea
    ].findIndex(
      card =>
        engine.getCardById<EquipCard>(card).EqupCategory ===
        equipCard.EqupCategory,
    );

    if (currentEquipIndex >= 0) {
      this.playerCards[PlayerCardsArea.EquipArea].splice(currentEquipIndex, 1);
    }

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard.Id);
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

  public set Character(character: Character) {
    this.playerCharacter = character;
  }
  public get Character() {
    return this.playerCharacter;
  }

  public get Id() {
    return this.playerId;
  }
}
