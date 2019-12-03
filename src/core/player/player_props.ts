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

export type ClientViewPlayer = {
  playerId: PlayerId;
  playerName: string;
  playerCharacterId?: CharacterId;
  playerRole?: PlayerRole;
};
