import { Sanguosha } from 'core/game/engine';
import { GameProcessor } from 'core/game/game_processor';
import { GameInfo } from 'core/game/game_props';
import { StageProcessor } from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { ServerRoom } from 'core/room/room.server';
import { Logger } from 'core/shares/libs/logger/logger';
import {
  DevMode,
  hostConfig,
  HostConfigProps,
} from 'core/shares/types/host_config';
import { LobbySocketEvent } from 'core/shares/types/server_types';
import {
  Languages,
  Translation,
} from 'core/translations/translation_json_tool';
import * as http from 'http';
import * as https from 'https';
import * as os from 'os';
import SocketIO from 'socket.io';
import { SimplifiedChinese } from './languages';
import { serverConfig, ServerConfig } from './server_config';

class App {
  private server: http.Server | https.Server;
  private rooms: ServerRoom[] = [];
  private roomsPathList: string[] = [];
  private config: HostConfigProps;
  private translator: Translation;

  private lobbySocket: SocketIO.Server;
  constructor(mode: DevMode, private logger: Logger) {
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
    this.logger.info('-----', 'Sanguosha Server Launched', '-----');
    this.logger.info(
      '-----',
      'Server Address',
      `${this.config.protocol}://${
        this.config.mode === DevMode.Dev
          ? this.getLocalExternalIP()
          : await this.getPublicExternalIp()
      }:${this.config.port}`,
      '-----',
    );
    this.logger.info('-----', 'Core Version', Sanguosha.Version, '-----');
  }

  private loadLanguages(language: Languages) {
    this.translator = Translation.setup(language, [
      Languages.ZH_CN,
      SimplifiedChinese,
    ]);

    this.logger.Translator = this.translator;
  }

  public start(config: ServerConfig) {
    this.loadLanguages(config.language);

    Sanguosha.initialize();
    this.log();

    this.lobbySocket.on('connection', socket => {
      socket
        .on(LobbySocketEvent.GameCreated.toString(), this.onGameCreated(socket))
        .on(
          LobbySocketEvent.SocketConfig.toString(),
          this.onQuerySocketConfig(socket),
        )
        .on(
          LobbySocketEvent.QueryRoomList.toString(),
          this.onQueryRoomsInfo(socket),
        )
        .on(
          LobbySocketEvent.QueryVersion.toString(),
          this.matchCoreVersion(socket),
        );
    });
  }

  private readonly matchCoreVersion = (socket: SocketIO.Socket) => (content: {
    version: string;
  }) => {
    socket.emit(
      LobbySocketEvent.VersionMismatch.toString(),
      content.version === Sanguosha.Version,
    );
  };

  private readonly onGameCreated = (socket: SocketIO.Socket) => (
    content: GameInfo,
  ) => {
    const roomId = Date.now();
    const roomSocket = new ServerSocket(
      this.config,
      this.lobbySocket.of('/room'),
      roomId,
      this.logger,
    );
    const room = new ServerRoom(
      roomId,
      content,
      roomSocket,
      new GameProcessor(new StageProcessor()),
    );

    room.onClosed(() => {
      this.rooms.filter(r => r !== room);
    });

    this.rooms.push(room);
    this.roomsPathList.push(roomSocket.RoomId);
    socket.emit(LobbySocketEvent.GameCreated.toString(), {
      roomId,
      roomInfo: content,
    });
  };

  private readonly onQuerySocketConfig = (socket: SocketIO.Socket) => () => {
    socket.emit(LobbySocketEvent.SocketConfig.toString(), this.config);
  };

  private readonly onQueryRoomsInfo = (socket: SocketIO.Socket) => () => {
    const roomsInfo = this.rooms.map(room => room.getRoomInfo());
    socket.emit(LobbySocketEvent.QueryRoomList.toString(), roomsInfo);
  };
}

const mode = (process.env.DEV_MODE as DevMode) || DevMode.Dev;

new App(mode, new Logger(mode)).start(serverConfig);
