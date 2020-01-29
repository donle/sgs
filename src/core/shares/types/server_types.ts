import { GameCharacterExtensions } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { HostConfigProps } from 'core/shares/types/host_config';

export const enum LobbySocketEvent {
  QueryRoomList = 'room-list',
  GameCreated = 'create-room',
  SocketConfig = 'config',
}

export const enum RoomSocketEvent {
  GameStart = 'game-start',
  PlayerReady = 'player-ready',
}

export type RoomInfo = {
  name: string;
  activePlayers: number;
  totalPlayers: number;
  status: 'playing' | 'waiting';
  packages: GameCharacterExtensions[];
};

export type RoomSocketEventPicker<
  E extends RoomSocketEvent
> = E extends RoomSocketEvent.GameStart
  ? {}
  : E extends RoomSocketEvent.PlayerReady
  ? {
      playerId: PlayerId;
      ready: boolean;
    }
  : never;

export type LobbySocketEventPicker<
  E extends LobbySocketEvent
> = E extends LobbySocketEvent.QueryRoomList
  ? RoomInfo[]
  : E extends LobbySocketEvent.SocketConfig
  ? HostConfigProps
  : never;
