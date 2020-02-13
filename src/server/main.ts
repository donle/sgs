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
import { Translation } from 'core/translations/translation_json_tool';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import SocketIO from 'socket.io';
import { getLanguageDictionary, Languages } from './languages';
import { serverConfig, ServerConfig } from './server_config';

class App {
  private server: http.Server | https.Server;
  private rooms: ServerRoom[] = [];
  private roomsPathList: string[] = [];
  private config: HostConfigProps;
  private translator: Translation;

  private lobbySocket: SocketIO.Server;
  constructor(mode: DevMode) {
    this.config = hostConfig[mode];
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

  private async getPublicExternalIp() {
    return await new Promise(resolve => {
      http.get('http://bot.whatismyipaddress.com/', res => {
        res.on('data', ip => resolve(ip));
      });
    });
  }

  private async log() {
    // tslint:disable-next-line: no-console
    console.info(
      `----- ${this.translator.tr('Sanguosha Server Launched')} -----`,
    );
    // tslint:disable-next-line: no-console
    console.info(
      `----- ${this.translator.tr('Server Address')}: ${
        this.config.protocal
      }://${
        this.config.mode === DevMode.Dev
          ? this.getLocalExternalIP()
          : await this.getPublicExternalIp()
      }:${this.config.port} -----`,
    );
    // tslint:disable-next-line: no-console
    console.info(
      `----- ${this.translator.tr('Core Version')}: ${Sanguosha.Version} -----`,
    );
  }

  private loadLanguages(language: Languages) {
    const dictionary = getLanguageDictionary(language);
    this.translator = Translation.setup(dictionary);
  }

  public start(config: ServerConfig) {
    this.loadLanguages(config.language);

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

new App((process.env.DEV_MODE as DevMode) || DevMode.Dev).start(serverConfig);
