import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { DevMode, hostConfig, HostConfigProps } from 'core/game/host.config';
import { ServerSocket } from 'core/network/socket.server';
import { ServerRoom } from 'core/room/room.server';
import * as http from 'http';
import * as https from 'https';
import * as SocketIO from 'socket.io';

const mode = process.env.DEV_MODE || DevMode.Dev;

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
    this.lobbySocket = SocketIO(this.server, { path: '/lobby' });
    this.server.listen(this.config.port);
  }

  public start() {
    this.lobbySocket.on('connect', socket => {
      socket.on(
        GameEventIdentifiers.GameCreatedEvent.toString(),
        (
          content: EventPicker<
            GameEventIdentifiers.GameCreatedEvent,
            WorkPlace.Client
          >,
        ) => {
          const roomSocket = new ServerSocket(this.config, this.rooms.length);
          const room = new ServerRoom(this.rooms.length, content.gameInfo, roomSocket);
          this.rooms.push(room);
          this.roomsPathList.push(roomSocket.RoomPath);
        },
      );
    });
  }
}

new App(process.env.DEV_MODE as DevMode).start();
