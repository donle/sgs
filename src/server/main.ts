import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { ServerSocket } from 'core/network/socket.server';
import { ServerRoom } from 'core/room/room.server';
import {
  DevMode,
  hostConfig,
  HostConfigProps,
} from 'core/shares/types/host_config';
import { LobbySocketEvent, RoomInfo } from 'core/shares/types/server_types';
import * as http from 'http';
import * as https from 'https';
import SocketIO from 'socket.io';

class App {
  private server: http.Server | https.Server;
  private rooms: ServerRoom[] = [];
  private roomsPathList: string[] = [];
  private config: HostConfigProps;

  private lobbySocket: SocketIO.Server;
  constructor(mode: DevMode) {
    this.config = hostConfig[mode];
    //TODO: to use https on prod in the future.
    this.server = http.createServer();
    this.lobbySocket = SocketIO.listen(this.server, {
      path: '/lobby',
      origins: '*:*',
    });
    this.server.listen(this.config.port);
  }

  public start() {
    Sanguosha.initialize();

    this.lobbySocket.on('connection', socket => {
      socket
        .on(
          GameEventIdentifiers.GameCreatedEvent.toString(),
          this.onGameCreated,
        )
        .on(LobbySocketEvent.SocketConfig, this.onQuerySocketConfig)
        .on(LobbySocketEvent.QueryRoomList, this.onQueryRoomsInfo);
    });
  }

  private readonly onGameCreated = (
    content: EventPicker<
      GameEventIdentifiers.GameCreatedEvent,
      WorkPlace.Client
    >,
  ) => {
    const roomSocket = new ServerSocket(this.config, this.rooms.length);
    const room = new ServerRoom(
      this.rooms.length,
      content.gameInfo,
      roomSocket,
    );
    this.rooms.push(room);
    this.roomsPathList.push(roomSocket.RoomPath);
  };

  private readonly onQuerySocketConfig = (socket: SocketIO.Socket) => () => {
    socket.emit(LobbySocketEvent.SocketConfig, this.config);
  };

  private readonly onQueryRoomsInfo = (): RoomInfo[] => {
    return this.rooms.map(room => room.getRoomInfo());
  };
}

new App((process.env.DEV_MODE as DevMode) || DevMode.Dev).start();
