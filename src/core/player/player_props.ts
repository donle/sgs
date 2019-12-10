import { CardId } from 'core/cards/card';
import { CharacterId } from 'core/characters/character';

export type PlayerId = string;

export type PlayerCards = {
  [K in PlayerCardsArea]: CardId[];
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

export interface PlayerInfo {
  Id: PlayerId;
  Name: string;
  CharacterId: CharacterId | undefined;
  Role: PlayerRole | undefined;
  Position: number | undefined;
};
