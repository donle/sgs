import { GameCharacterExtensions } from 'core/game/game_props';
import { HostConfigProps } from 'core/shares/types/host_config';

export const enum LobbySocketEvent {
  QueryRoomList = 'room-list',
  GameCreated = 'create-room',
  SocketConfig = 'config',
}

export type RoomInfo = {
  name: string;
  activePlayers: number;
  totalPlayers: number;
  status: 'playing' | 'waiting';
  packages: GameCharacterExtensions[];
};

export type LobbySocketEventPicker<
  E extends LobbySocketEvent
> = E extends LobbySocketEvent.QueryRoomList
  ? RoomInfo[]
  : E extends LobbySocketEvent.SocketConfig
  ? HostConfigProps
  : never;
