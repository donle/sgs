import { CardId } from 'core/cards/card';
import { CharacterId } from 'core/characters/character';

export type PlayerId = string;

export type PlayerCardsOutside =  & {
  [S in PlayerCardsArea.OutsideArea]: {
    [SkillName: string]: CardId[];
  };
};

export type PlayerCards = {
  [K in keyof Pick<
    keyof typeof PlayerCardsArea,
    Exclude<PlayerCardsArea, PlayerCardsArea.OutsideArea>
  >]: CardId[];
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
  OutsideArea,
}

export interface PlayerInfo {
  Id: PlayerId;
  Name: string;
  Position: number;
  CharacterId: CharacterId | undefined;
  Role: PlayerRole | undefined;
}
