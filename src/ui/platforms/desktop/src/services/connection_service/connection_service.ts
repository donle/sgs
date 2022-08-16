import { GameCardExtensions } from 'core/game/game_props';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
import { LobbySocketEvent, LobbySocketEventPicker } from 'core/shares/types/server_types';
import { ServerHostTag } from 'props/config_props';

export type ChatPacketObject = { message: string; from: string; timestamp: number };
export type RoomListListenerResponse = {
  packet: LobbySocketEventPicker<LobbySocketEvent.QueryRoomList>;
  hostTag: ServerHostTag;
  ping: number;
};
export type VersionCheckListenerResponse = {
  packet: LobbySocketEventPicker<LobbySocketEvent.VersionMismatch>;
  hostTag: ServerHostTag;
  ping: number;
};
export type CreateGameListenerResponse = {
  packet?: LobbySocketEventPicker<LobbySocketEvent.GameCreated>;
  error?: string;
  hostTag: ServerHostTag;
  ping: number;
};
export type CreateWaitingRoomListenerResponse = {
  packet?: LobbySocketEventPicker<LobbySocketEvent.CreateWaitingRoom>;
  error?: string;
  hostTag: ServerHostTag;
  ping: number;
};

export abstract class ConnectionService {
  protected abstract chatSocket: SocketIOClient.Socket;
  protected chatHistory: ChatPacketObject[] = [];

  protected abstract readonly lobbyService: {
    getRoomList(callback: (response: RoomListListenerResponse) => void): void;
    checkCoreVersion(callback: (response: VersionCheckListenerResponse) => void): void;
    checkRoomExist(host: ServerHostTag, id: RoomId, callback: (exist: boolean, ping: number) => void): void;
    createWaitingRoom(
      gameInfo: TemporaryRoomCreationInfo & { roomId?: number },
      callback: (response: CreateWaitingRoomListenerResponse) => void,
    ): void;
    /**
     * @deprecated game won't be created from lobby anymore.
     */
    createGame(
      gameInfo: {
        cardExtensions: GameCardExtensions[];
      } & TemporaryRoomCreationInfo & { roomId?: number },
      callback: (response: CreateGameListenerResponse) => void,
    ): void;
    ping(hostTag: ServerHostTag, callback: (ping: number) => void): void;
  };

  protected abstract readonly chatService: {
    send(message: string, playerName: string): void;
    disconnect(): void;
    received(action: (data: ChatPacketObject) => void): void;
    chatHistory(): ChatPacketObject[];
  };

  public get Lobby() {
    return this.lobbyService;
  }

  public get Chat() {
    return this.chatService;
  }

  public abstract close(): void;
}
