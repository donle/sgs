import { GameCardExtensions } from 'core/game/game_props';
import { ChatSocketEvent, LobbySocketEvent, LobbySocketEventPicker } from 'core/shares/types/server_types';
import { TemporaryRoomCreationInfo } from 'pages/lobby/ui/create_room_dialog/create_room_dialog';
import { ClientConfig, ServerHostTag } from 'props/config_props';
import SocketIOClient from 'socket.io-client';
import { RoomId } from 'core/room/room';

type ChatPacketObject = { message: string; from: string; timestamp: number };
type RoomListListenerResponse = {
  packet: LobbySocketEventPicker<LobbySocketEvent.QueryRoomList>;
  hostTag: ServerHostTag;
  ping: number;
};
type VersionCheckListenerResponse = {
  packet: LobbySocketEventPicker<LobbySocketEvent.VersionMismatch>;
  hostTag: ServerHostTag;
  ping: number;
};
type CreateGameListenerResponse = {
  packet: LobbySocketEventPicker<LobbySocketEvent.GameCreated>;
  hostTag: ServerHostTag;
  ping: number;
};

export class ConnectionService {
  private chatSocket: SocketIOClient.Socket;
  private lobbySockets: Map<ServerHostTag, SocketIOClient.Socket> = new Map<ServerHostTag, SocketIOClient.Socket>();
  constructor(config: ClientConfig) {
    const { protocol, host, port } = config.host[0];
    const mainConnectionUrl = `${protocol}://${host}:${port}/`;
    this.chatSocket = SocketIOClient(mainConnectionUrl + 'chat');

    for (const hostInfo of config.host) {
      console.log(hostInfo);
      this.lobbySockets.set(
        hostInfo.hostTag,
        SocketIOClient(`${hostInfo.protocol}://${hostInfo.host}:${hostInfo.port}/`),
      );
    }
  }

  private pingStartTimestamp: number;

  private readonly lobbyService = {
    getRoomList: (callback: (response: RoomListListenerResponse) => void) => {
      this.pingStartTimestamp = Date.now();
      this.lobbySockets.forEach((lobbySocket, hostTag) => {
        lobbySocket.emit(LobbySocketEvent.QueryRoomList.toString());
        lobbySocket.on(LobbySocketEvent.QueryRoomList.toString(), evt => {
          callback({ packet: evt, hostTag, ping: Math.round((Date.now() - this.pingStartTimestamp) / 2) });
        });
      });
    },
    checkCoreVersion: (callback: (response: VersionCheckListenerResponse) => void) => {
      this.pingStartTimestamp = Date.now();
      this.lobbySockets.forEach((lobbySocket, hostTag) => {
        lobbySocket.emit(LobbySocketEvent.VersionMismatch.toString());
        lobbySocket.on(LobbySocketEvent.VersionMismatch.toString(), evt => {
          callback({ packet: evt, hostTag, ping: Math.round((Date.now() - this.pingStartTimestamp) / 2) });
        });
      });
    },
    checkRoomExist: (host: ServerHostTag, id: RoomId, callback: (exist: boolean) => void) => {
      const lobbySocket = this.lobbySockets.get(host)!;
      lobbySocket.emit(LobbySocketEvent.CheckRoomExist.toString(), id);
      lobbySocket.on(LobbySocketEvent.CheckRoomExist.toString(), (exist: boolean) => {
        callback(exist);
      });
    },
    createGame: (
      gameInfo: {
        cardExtensions: GameCardExtensions[];
      } & TemporaryRoomCreationInfo,
      host: ServerHostTag,
      callback: (response: CreateGameListenerResponse) => void,
    ) => {
      this.pingStartTimestamp = Date.now();
      this.lobbySockets.forEach((lobbySocket, hostTag) => {
        lobbySocket.emit(LobbySocketEvent.GameCreated.toString(), gameInfo);
        lobbySocket.on(LobbySocketEvent.GameCreated.toString(), evt => {
          callback({ packet: evt, hostTag, ping: Math.round((Date.now() - this.pingStartTimestamp) / 2) });
        });
      });
    },
    ping: (hostTag: ServerHostTag, callback: (ping: number) => void) => {
      const lobbySocket = this.lobbySockets.get(hostTag) as SocketIOClient.Socket;
      lobbySocket.emit(LobbySocketEvent.VersionMismatch.toString());
      lobbySocket.on(LobbySocketEvent.VersionMismatch.toString(), evt => {
        callback(Math.round((Date.now() - this.pingStartTimestamp) / 2));
      });
    },
  };

  private readonly chatService = {
    send: (message: string, playerName: string) => {
      this.chatSocket.emit(ChatSocketEvent.Chat, { message, from: playerName, timestamp: Date.now() });
    },
    disconnect: () => {
      this.chatSocket.on(ChatSocketEvent.Chat, data => {
        if (!this.chatHistory.includes(data)) {
          this.chatHistory.push(data);
        }
        if (this.chatHistory.length > 50) {
          this.chatHistory.shift();
        }
      });
    },
    received: (action: (data: ChatPacketObject) => void) => {
      this.chatSocket.on(ChatSocketEvent.Chat, data => {
        if (!this.chatHistory.includes(data)) {
          this.chatHistory.push(data);
        }
        if (this.chatHistory.length > 50) {
          this.chatHistory.shift();
        }
        action(data);
      });
    },
    chatHistory: () => {
      return this.chatHistory;
    },
  };

  private chatHistory: ChatPacketObject[] = [];

  public get Lobby() {
    return this.lobbyService;
  }

  public get Chat() {
    return this.chatService;
  }
}
