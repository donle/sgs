import { CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';

export type PlayerId = string;

export type PlayerCardsOutside = {
  [SkillName: string]: CardId[];
};

export type PlayerCards = {
  [K in Extract<PlayerCardsArea, Exclude<PlayerCardsArea, PlayerCardsArea.OutsideArea>>]: CardId[];
};

export const enum PlayerRole {
  Unknown,
  Lord,
  Loyalist,
  Rebel,
  Renegade,
}

export const enum PlayerCardsArea {
  HandArea,
  EquipArea,
  JudgeArea,
  OutsideArea,
}

export interface PlayerInfo {
  Id: PlayerId;
  Name: string;
  Position: number;
  CharacterId: CharacterId | undefined;
  Role: PlayerRole | undefined;
  Hp: number;
  MaxHp: number;
}

export const enum DistanceType {
  Offense,
  Defense,
  Attack,
}
