import { Sanguosha } from 'core/game/engine';
import { GameProcessor } from 'core/game/game_processor';
import { GameInfo } from 'core/game/game_props';
import { StageProcessor } from 'core/game/stage_processor';
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
import { AddressInfo } from 'net';
import * as os from 'os';
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

  private getLocalExternalIP() {
    const { networkInterfaces } = os;

    return ([] as os.NetworkInterfaceInfo[])
      .concat(...Object.values(networkInterfaces()))
      .filter(details => details.family === 'IPv4' && !details.internal)
      .pop()!.address;
  }

  private log() {
    const address = this.server.address() as AddressInfo;
    // tslint:disable-next-line: no-console
    console.info('----- Sanguosha server started -----');
    // tslint:disable-next-line: no-console
    console.info(
      `----- ${this.config.protocal}://${this.getLocalExternalIP()}:${this.config.port} -----`,
    );
    // tslint:disable-next-line: no-console
    console.info(`----- core version: ${Sanguosha.Version} -----`);
  }

  public start() {
    Sanguosha.initialize();
    this.log();

    this.lobbySocket.on('connection', socket => {
      socket
        .on(LobbySocketEvent.GameCreated, this.onGameCreated)
        .on(LobbySocketEvent.SocketConfig, this.onQuerySocketConfig(socket))
        .on(LobbySocketEvent.QueryRoomList, this.onQueryRoomsInfo);
    });
  }

  private readonly onGameCreated = (content: GameInfo) => {
    const roomSocket = new ServerSocket(this.config, this.rooms.length);
    const room = new ServerRoom(
      this.rooms.length,
      content,
      roomSocket,
      new GameProcessor(new StageProcessor()),
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
