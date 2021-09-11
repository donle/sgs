import { GameCardExtensions } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
import { ChatSocketEvent, LobbySocketEvent } from 'core/shares/types/server_types';
import { TemporaryRoomCreationInfo } from 'pages/lobby/ui/create_room_dialog/create_room_dialog';
import { ClientConfig, ServerHostTag } from 'props/config_props';
import SocketIOClient from 'socket.io-client';
import {
  ChatPacketObject,
  ConnectionService,
  CreateGameListenerResponse,
  RoomListListenerResponse,
  VersionCheckListenerResponse,
} from './connection_service';

export class RealConnectionService extends ConnectionService {
  protected chatSocket: SocketIOClient.Socket;
  protected chatHistory: ChatPacketObject[] = [];

  private lobbySockets: Map<ServerHostTag, SocketIOClient.Socket> = new Map<ServerHostTag, SocketIOClient.Socket>();
  private queryRoomListListener: (res: RoomListListenerResponse) => void;
  private versionCheckListener: (res: VersionCheckListenerResponse) => void;
  private createGameListener: (res: Omit<CreateGameListenerResponse, 'hostTag'>) => void;
  private pingListener: (ping: number) => void;
  private pingBestHost: Promise<ServerHostTag>[] = [];
  constructor(config: ClientConfig) {
    super();
    const { protocol, host, port } = config.host[0];
    const mainConnectionUrl = `${protocol}://${host}:${port}/`;
    this.chatSocket = SocketIOClient(mainConnectionUrl + 'chat');

    for (const hostInfo of config.host) {
      this.lobbySockets.set(
        hostInfo.hostTag,
        SocketIOClient(`${hostInfo.protocol}://${hostInfo.host}:${hostInfo.port}/lobby`),
      );
    }

    this.lobbySockets.forEach((lobbySocket, hostTag) => {
      lobbySocket.on(LobbySocketEvent.QueryRoomList.toString(), evt => {
        this.queryRoomListListener?.({
          packet: evt,
          hostTag,
          ping: Math.round((Date.now() - this.pingStartTimestamp) / 2),
        });
      });
      lobbySocket.on(LobbySocketEvent.VersionMismatch.toString(), evt => {
        this.versionCheckListener?.({
          packet: evt,
          hostTag,
          ping: Math.round((Date.now() - this.pingStartTimestamp) / 2),
        });
      });
      lobbySocket.on(LobbySocketEvent.GameCreated.toString(), evt => {
        this.createGameListener?.({
          packet: evt,
          ping: Math.round((Date.now() - this.pingStartTimestamp) / 2),
        });
      });
      lobbySocket.on(LobbySocketEvent.PingServer.toString(), () => {
        this.pingListener?.(Math.round((Date.now() - this.pingStartTimestamp) / 2));
      });
      for (const [host, lobbySocket] of this.lobbySockets.entries()) {
        this.pingBestHost.push(
          new Promise<ServerHostTag>(resolve =>
            lobbySocket.on(LobbySocketEvent.PingServer.toString(), () => resolve(host)),
          ),
        );
      }
    });
  }

  private pingStartTimestamp: number;

  protected readonly lobbyService = {
    getRoomList: (callback: (response: RoomListListenerResponse) => void) => {
      this.pingStartTimestamp = Date.now();
      this.queryRoomListListener = callback;
      this.lobbySockets.forEach(lobbySocket => {
        lobbySocket.emit(LobbySocketEvent.QueryRoomList.toString());
      });
    },
    checkCoreVersion: (callback: (response: VersionCheckListenerResponse) => void) => {
      this.pingStartTimestamp = Date.now();
      this.versionCheckListener = callback;
      this.lobbySockets.forEach(lobbySocket => {
        lobbySocket.emit(LobbySocketEvent.VersionMismatch.toString());
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
      callback: (response: CreateGameListenerResponse) => void,
    ) => {
      this.pingStartTimestamp = Date.now();
      Promise.race(this.pingBestHost).then(serverHost => {
        const lobbySocket = this.lobbySockets.get(serverHost)!;
        lobbySocket.emit(LobbySocketEvent.GameCreated.toString(), gameInfo);
        this.createGameListener = res => {
          callback({ ...res, hostTag: serverHost });
        };
      });
      for (const [, lobbySocket] of this.lobbySockets.entries()) {
        lobbySocket.emit(LobbySocketEvent.PingServer.toString());
      }
    },
    ping: (hostTag: ServerHostTag, callback: (ping: number) => void) => {
      this.pingStartTimestamp = Date.now();
      const lobbySocket = this.lobbySockets.get(hostTag) as SocketIOClient.Socket;
      this.pingListener = callback;
      lobbySocket.emit(LobbySocketEvent.PingServer.toString());
    },
  };

  protected readonly chatService = {
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

  public close() {
    this.chatSocket.close();
    for (const [, socket] of this.lobbySockets) {
      socket.close();
    }
  }
}
