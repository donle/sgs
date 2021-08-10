import { GameCardExtensions } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
import { LobbySocketEvent, LobbySocketEventPicker } from 'core/shares/types/server_types';
import { TemporaryRoomCreationInfo } from 'pages/lobby/ui/create_room_dialog/create_room_dialog';
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
  packet: LobbySocketEventPicker<LobbySocketEvent.GameCreated>;
  hostTag: ServerHostTag;
  ping: number;
};

export abstract class ConnectionService {
  protected abstract chatSocket: SocketIOClient.Socket;
  protected chatHistory: ChatPacketObject[] = [];

  protected abstract readonly lobbyService: {
    getRoomList(callback: (response: RoomListListenerResponse) => void): void;
    checkCoreVersion(callback: (response: VersionCheckListenerResponse) => void): void;
    checkRoomExist(host: ServerHostTag, id: RoomId, callback: (exist: boolean) => void): void;
    createGame(
      gameInfo: {
        cardExtensions: GameCardExtensions[];
      } & TemporaryRoomCreationInfo,
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
}
