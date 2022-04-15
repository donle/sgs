import { WorkPlace } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameProcessor } from 'core/game/game_processor/game_processor';
import { OneVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.1v2';
import { TwoVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.2v2';
import { PveGameProcessor } from 'core/game/game_processor/game_processor.pve';
import { StandardGameProcessor } from 'core/game/game_processor/game_processor.standard';
import { GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { StageProcessor } from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { WaitingRoomInfo } from 'core/room/waiting_room';
import { Logger } from 'core/shares/libs/logger/logger';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { Languages } from 'core/translations/translation_json_tool';
import { TranslationModule } from 'core/translations/translation_module';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import { LobbyEventChannel } from './channels/lobby';
import { WaitingRoomSocket } from './channels/waiting_room';
import { SimplifiedChinese } from './languages';
import { getServerConfig, ServerConfig } from './server_config';
import { RoomService } from './services/room_service';

const mode = (process.env.REACT_APP_DEV_MODE as Flavor) || Flavor.Dev;
const config = getServerConfig(mode);
const server = http.createServer();
const lobbySocket = SocketIO.listen(server, {
  origins: '*:*',
});
server.listen(config.port);
const logger = new Logger(mode);

function createDifferentModeGameProcessor(gameMode: GameMode): GameProcessor {
  logger.debug('game mode is ' + gameMode);
  switch (gameMode) {
    case GameMode.Pve:
      return new PveGameProcessor(new StageProcessor(logger), logger);
    case GameMode.OneVersusTwo:
      return new OneVersusTwoGameProcessor(new StageProcessor(logger), logger);
    case GameMode.TwoVersusTwo:
      return new TwoVersusTwoGameProcessor(new StageProcessor(logger), logger);
    case GameMode.Standard:
    default:
      return new StandardGameProcessor(new StageProcessor(logger), logger);
  }
}

class App {
  private translator: TranslationModule;
  constructor(private config: ServerConfig, private logger: Logger, private lobbyEventChannel: LobbyEventChannel) {}

  private async log() {
    this.logger.info('-----', 'Sanguosha Server Launched', '-----');
    this.logger.info('-----', 'Server listening at port ', `${this.config.port}`, '-----');
    this.logger.info('-----', 'Core Version', Sanguosha.Version, '-----');
  }

  private loadLanguages(language: Languages) {
    this.translator = TranslationModule.setup(language, [Languages.ZH_CN, SimplifiedChinese]);

    this.logger.Translator = this.translator;
  }

  public start() {
    this.loadLanguages(this.config.language);
    Sanguosha.initialize();
    this.lobbyEventChannel.start();

    this.log();
  }
}

const roomService = new RoomService(
  lobbySocket,
  (roomChannel: SocketIO.Namespace, roomId: RoomId) => new ServerSocket(roomChannel, roomId, logger),
  (
    roomId: RoomId,
    gameInfo: TemporaryRoomCreationInfo,
    socket: ServerSocket,
    gameProcessor: GameProcessor,
    analytics: RecordAnalytics,
    players: Player[],
    flavor: Flavor,
    gameMode: GameMode,
    gameCommonRules: GameCommonRules,
    eventStack: RoomEventStacker<WorkPlace.Server>,
  ) => {
    const roomInfo: GameInfo = { ...gameInfo, flavor: mode, campaignMode: !!gameInfo.campaignMode };
    return new ServerRoom(
      roomId,
      roomInfo,
      socket,
      gameProcessor,
      analytics,
      players,
      flavor,
      logger,
      gameMode,
      gameCommonRules,
      eventStack,
    );
  },
  () => new RecordAnalytics(),
  () => new GameCommonRules(),
  () => new RoomEventStacker<WorkPlace.Server>(),
  (info: TemporaryRoomCreationInfo) => {
    const roomId: RoomId = Date.now();
    return {
      roomId,
      roomInfo: info,
      closedSeats: [],
      players: [],
      hostPlayerId: info.hostPlayerId,
    };
  },
  (socket: SocketIO.Namespace, roomInfo: WaitingRoomInfo) =>
    new WaitingRoomSocket(roomService, socket, mode, logger, roomInfo),
  createDifferentModeGameProcessor,
);

new App(config, logger, new LobbyEventChannel(roomService, lobbySocket, config)).start();
