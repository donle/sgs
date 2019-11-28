import { Card, CardId, EquipCard } from 'core/cards/card';
import { Character } from 'core/characters/character';

export type PlayerId = string;
export type PlayerProps = {
  playerId: PlayerId;
  playerName: string;
  playerCharacter?: Character;
  playerRole?: PlayerRole;
  playerCards?: PlayerCards;
};

export type PlayerCards = {
  [K in PlayerCardsArea]: K extends PlayerCardsArea.EquipArea
    ? EquipCard[]
    : Card[];
};

export const enum PlayerRole {
  Unknown,
  Lord,
  Loyalist,
  Rebel,
  Renegade,
}

export const enum PlayerCardsArea {
  JudgeArea,
  EquipArea,
  HandArea,
  HoldingArea,
}

export abstract class Player {
  protected playerId: PlayerId;
  protected playerName: string;
  protected playerCharacter: Character;
  private playerRole: PlayerRole;
  private playerCards: PlayerCards;
  private hp: number;
  private maxHp: number;

  constructor(props: PlayerProps) {
    this.playerRole = PlayerRole.Unknown;
    this.playerCards = {
      [PlayerCardsArea.HandArea]: [],
      [PlayerCardsArea.JudgeArea]: [],
      [PlayerCardsArea.HoldingArea]: [],
      [PlayerCardsArea.EquipArea]: [],
    };

    for (const [key, value] of Object.entries(props)) {
      this[key] = value;
    }

    this.hp = this.playerCharacter.MaxHp;
    this.maxHp = this.playerCharacter.MaxHp;
  }

  public getCards(area?: PlayerCardsArea) {
    if (area === undefined) {
      const [handCards, judgeCards, holdingCards, equipCards] = Object.values(
        this.playerCards,
      );
      return [...handCards, ...judgeCards, ...holdingCards, ...equipCards];
    }

    return this.playerCards[area];
  }

  public getCard(cardId: CardId): Card | undefined {
    for (const cards of Object.values(this.playerCards)) {
      const targetCard = cards.find(card => card.Id === cardId);
      if (targetCard !== undefined) {
        return targetCard;
      }
    }
  }

  public cardFrom(cardId: CardId): PlayerCardsArea | undefined {
    for (const [area, cards] of Object.entries(this.playerCards)) {
      if (cards.find(card => card.Id === cardId)) {
        return area as any as PlayerCardsArea;
      }
    }
  }

  public equip(equipCard: EquipCard) {
    const currentEquipIndex = this.playerCards[
      PlayerCardsArea.EquipArea
    ].findIndex(card => card.CardType === equipCard.CardType);

    if (currentEquipIndex >= 0) {
      this.playerCards[PlayerCardsArea.EquipArea].splice(currentEquipIndex, 1);
    }

    this.playerCards[PlayerCardsArea.EquipArea].push(equipCard);
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
