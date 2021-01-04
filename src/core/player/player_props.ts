import { CardId } from 'core/cards/libs/card_props';
import { CharacterId, CharacterNationality } from 'core/characters/character';

export type PlayerId = string;

export type PlayerCardsOutside = {
  [SkillName: string]: (CardId | CharacterId)[];
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

export const enum PlayerStatus {
  Online = 'online',
  Offline = 'offline',
  Quit = 'quit',
  Trusted = 'trusted',
}

export interface PlayerInfo {
  Id: PlayerId;
  Name: string;
  Position: number;
  CharacterId: CharacterId | undefined;
  Nationality: CharacterNationality | undefined;
  Role: PlayerRole | undefined;
  Hp: number;
  MaxHp: number;
}

export const enum DistanceType {
  Offense,
  Defense,
  Attack,
}
