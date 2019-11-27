import { PlayerRole } from 'core/player';

export type FinalPlayersData = {
  playerName: string;
  playerCharacterName: string;
  playerRole: PlayerRole;
  playerDead: boolean;
}[];
