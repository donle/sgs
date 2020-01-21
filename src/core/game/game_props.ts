import { PlayerRole } from 'core/player/player_props';

export const UNLIMITED_TRIGGERING_TIMES = 1000;
export const FORBIDDEN_TRIGGERING_TIMES = -9999;

export const enum GameCharacterExtensions {
  Standard = 'standard',
  // Wind,
  // Forest,
  // Fire,
  // Hill,
  // SP,
  // NewStandard,
  // God,
}

export const enum GameCardExtensions {
  Standard = 'standard',
}

export type GameInfo = {
  characterExtensions: GameCharacterExtensions[];
  cardExtensions: GameCardExtensions[];
  numberOfPlayers: number;
  multiCharacters?: boolean;
};

export const enum DamageType {
  Normal,
  Fire,
  Thunder,
}

export type FinalPlayersData = {
  playerName: string;
  playerCharacterName: string;
  playerRole: PlayerRole;
  playerDead: boolean;
}[];
