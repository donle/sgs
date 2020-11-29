import { GameCharacterExtensions, GameInfo } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { GameMode } from './room_props';

export const enum LobbySocketEvent {
  QueryRoomList,
  GameCreated,
  QueryVersion,
  VersionMismatch,
}

export const enum RoomSocketEvent {
  CreatRoom = 'create-room',
  PlayerReady = 'player-ready',
}

export type RoomInfo = {
  name: string;
  activePlayers: number;
  totalPlayers: number;
  status: 'playing' | 'waiting';
  packages: GameCharacterExtensions[];
  id: RoomId;
  gameMode: GameMode;
  passcode?: string;
};

type RoomEventUtilities = {
  [K in keyof typeof LobbySocketEvent]: any;
};

export type RoomSocketEventPicker<E extends RoomSocketEvent> = RoomEventList[E];
export type RoomSocketEventResponser<E extends RoomSocketEvent> = RoomEventResponseList[E];

interface RoomEventResponseList extends RoomEventUtilities {
  [RoomSocketEvent.CreatRoom]: never;
  [RoomSocketEvent.PlayerReady]: never;
}

interface RoomEventList extends RoomEventUtilities {
  [RoomSocketEvent.CreatRoom]: {
    roomInfo: GameInfo;
  };
  [RoomSocketEvent.PlayerReady]: {
    playerId: PlayerId;
    ready: boolean;
  };
}

export type LobbySocketEventPicker<E extends LobbySocketEvent> = LobbyEventList[E];

type LobbyEventUtilities = {
  [K in keyof typeof LobbySocketEvent]: any;
};

interface LobbyEventList extends LobbyEventUtilities {
  [LobbySocketEvent.GameCreated]: {
    roomInfo: GameInfo;
    roomId: RoomId;
  };
  [LobbySocketEvent.QueryRoomList]: RoomInfo[];
  [LobbySocketEvent.QueryVersion]: {
    version: string;
  };
  [LobbySocketEvent.VersionMismatch]: boolean;
}
