import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions } from 'core/game/game_props';
import { ChatSocketEvent, LobbySocketEvent, LobbySocketEventPicker } from 'core/shares/types/server_types';
import { TemporaryRoomCreationInfo } from 'pages/lobby/ui/create_room_dialog/create_room_dialog';
import { ClientConfig } from 'props/config_props';
import SocketIOClient from 'socket.io-client';

type ChatPacketObject = { message: string; from: string; timestamp: number };

export class ConnectionService {
  private chatSocket: SocketIOClient.Socket;
  private lobbySocket: SocketIOClient.Socket;
  private baseConnectionUrl: string;
  constructor(config: ClientConfig) {
    this.baseConnectionUrl = `${config.host.protocol}://${config.host.host}:${config.host.port}/`;
    this.chatSocket = SocketIOClient(this.baseConnectionUrl + 'chat');
    this.lobbySocket = SocketIOClient(this.baseConnectionUrl + 'lobby');
  }

  private pingReceiver: (ping: number) => void;
  private pingStartTimestamp: number;

  private readonly lobbyService = {
    getRoomList: async () => {
      this.pingStartTimestamp = Date.now();
      this.lobbySocket.emit(LobbySocketEvent.QueryRoomList.toString());
      return new Promise<LobbySocketEventPicker<LobbySocketEvent.QueryRoomList>>(resolve => {
        this.lobbySocket.on(LobbySocketEvent.QueryRoomList.toString(), evt => {
          this.pingReceiver?.(Math.round((Date.now() - this.pingStartTimestamp) / 2));
          resolve(evt);
        });
      });
    },
    checkCoreVersion: async () => {
      this.pingStartTimestamp = Date.now();
      this.lobbySocket.emit(LobbySocketEvent.QueryVersion.toString(), {
        version: Sanguosha.Version,
      });
      return new Promise<LobbySocketEventPicker<LobbySocketEvent.VersionMismatch>>(resolve => {
        this.lobbySocket.on(LobbySocketEvent.VersionMismatch.toString(), evt => {
          this.pingReceiver?.(Math.round((Date.now() - this.pingStartTimestamp) / 2));
          resolve(evt);
        });
      });
    },
    createGame: async (
      gameInfo: {
        cardExtensions: GameCardExtensions[];
      } & TemporaryRoomCreationInfo,
    ) => {
      this.lobbySocket.emit(LobbySocketEvent.GameCreated.toString(), gameInfo);
      return new Promise<LobbySocketEventPicker<LobbySocketEvent.GameCreated>>(resolve => {
        this.lobbySocket.on(LobbySocketEvent.GameCreated.toString(), evt => {
          resolve(evt);
        });
      });
    },
    ping: (action: (ping: number) => void) => {
      this.pingReceiver = action;
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
