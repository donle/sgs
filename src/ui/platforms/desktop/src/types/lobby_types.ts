import { GameCharacterExtensions } from 'core/game/game_props';

export type RoomList = {
  name: string;
  activePlayers: number;
  totalPlayers: number;
  status: 'playing' | 'waiting';
  packages: GameCharacterExtensions[];
};
