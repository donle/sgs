import { GameCharacterExtensions, GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { GameMode } from './room_props';

export const enum LobbySocketEvent {
  QueryRoomList,
  GameCreated,
  QueryVersion,
  VersionMismatch,
  PingServer,
  CheckRoomExist,
  CreateWaitingRoom,
  EnterWaitingRoom,
}

export const enum ChatSocketEvent {
  Chat = 'chat',
}

export const enum RoomSocketEvent {
  CreateRoom = 'create-room',
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
  allowObserver: boolean;
};

export type RoomShortcutInfo = RoomInfo & {
  currentPlayerId: PlayerId;
  currentPhasePlayerId: PlayerId;
  currentPlayerStage: PlayerPhaseStages;
  currentPlayerPhase: PlayerPhase;
};

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
  [LobbySocketEvent.CheckRoomExist]: boolean;
  [LobbySocketEvent.CreateWaitingRoom]:
    | {
        roomInfo: TemporaryRoomCreationInfo;
        roomId: RoomId;
      }
    | { error: string };
  [LobbySocketEvent.EnterWaitingRoom]: {
    roomInfo: TemporaryRoomCreationInfo;
  };
}
