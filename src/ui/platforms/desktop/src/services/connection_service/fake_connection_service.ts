import { GameCardExtensions } from 'core/game/game_props';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
import { ChatSocketEvent } from 'core/shares/types/server_types';
import { ClientConfig, ServerHostTag } from 'props/config_props';
import SocketIOClient from 'socket.io-client';
import {
  ChatPacketObject,
  ConnectionService,
  CreateGameListenerResponse,
  CreateWaitingRoomListenerResponse,
  RoomListListenerResponse,
  VersionCheckListenerResponse,
} from './connection_service';

export class FakeConnectionService extends ConnectionService {
  protected chatSocket: SocketIOClient.Socket;
  protected chatHistory: ChatPacketObject[] = [];

  constructor(config: ClientConfig) {
    super();
    const { protocol, host, port } = config.host[0];
    const mainConnectionUrl = `${protocol}://${host}:${port}/`;
    this.chatSocket = SocketIOClient(mainConnectionUrl + 'chat');
  }

  protected readonly lobbyService = {
    // tslint:disable-next-line:no-empty
    getRoomList: (callback: (response: RoomListListenerResponse) => void) => {},
    // tslint:disable-next-line:no-empty
    checkCoreVersion: (callback: (response: VersionCheckListenerResponse) => void) => {},
    // tslint:disable-next-line:no-empty
    checkRoomExist: (host: ServerHostTag, id: RoomId, callback: (exist: boolean) => void) => {},
    createWaitingRoom(
      gameInfo: TemporaryRoomCreationInfo,
      callback: (response: CreateWaitingRoomListenerResponse) => void,
    // tslint:disable-next-line: no-empty
    ): void {},
    /**
     * @deprecated game won't be created from lobby anymore.
     */
    createGame: (
      gameInfo: {
        cardExtensions: GameCardExtensions[];
      } & TemporaryRoomCreationInfo,
      callback: (response: CreateGameListenerResponse) => void,
      // tslint:disable-next-line:no-empty
    ) => {},
    // tslint:disable-next-line:no-empty
    ping: (hostTag: ServerHostTag, callback: (ping: number) => void) => {},
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
  }
}
