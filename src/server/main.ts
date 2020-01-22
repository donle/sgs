import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { DevMode, hostConfig, HostConfigProps } from 'core/game/host.config';
import { ServerSocket } from 'core/network/socket.server';
import { ServerRoom } from 'core/room/room.server';
import { LobbySocketEvent, RoomInfo } from 'core/shares/types/server_types';
import * as http from 'http';
import * as https from 'https';
import * as SocketIO from 'socket.io';

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
    this.lobbySocket = SocketIO(this.server, { path: '/lobby', origins: '*:*' });
    this.server.listen(this.config.port);
  }

  public start() {
    this.lobbySocket.on('connect', socket => {
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
