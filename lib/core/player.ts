import { Card, EquipCard } from 'cards/card';
import { Character, CharacterId } from 'characters/character';

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
  }

  public getCards(area: PlayerCardsArea) {
    return this.playerCards[area];
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

  public assignRole(role: PlayerRole) {
    this.playerRole = role;
  }

  public assignCharacter(character: Character) {
    this.playerCharacter = character;
  }

  public get Role() {
    return this.playerRole;
  }
}
