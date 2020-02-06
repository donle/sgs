import { PlayerRole } from 'core/player/player_props';

export const INFINITE_TRIGGERING_TIMES = 1000;
export const NONE_TRIGGERING_TIMES = -9999;
export const INFINITE_DISTANCE = 1000;

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
  // BattleWat = 'battlewar',
}

export type GameInfo = {
  characterExtensions: GameCharacterExtensions[];
  cardExtensions: GameCardExtensions[];
  numberOfPlayers: number;
  roomName: string;
  multiCharacters?: boolean;
};

export const enum DamageType {
  Normal = 'normal_property',
  Fire = 'fire_property',
  Thunder = 'thunder_property',
}

export type FinalPlayersData = {
  playerName: string;
  playerCharacterName: string;
  playerRole: PlayerRole;
  playerDead: boolean;
}[];
