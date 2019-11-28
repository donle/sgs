import { PlayerRole } from 'core/player/player';

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

export type FinalPlayersData = {
  playerName: string;
  playerCharacterName: string;
  playerRole: PlayerRole;
  playerDead: boolean;
}[];
