import { Sanguosha } from 'core/game/engine';
import { createLogger } from 'core/shares/libs/logger/create';
import { Logger } from 'core/shares/libs/logger/logger';
import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { TranslationModule } from 'core/translations/translation_module';
import * as SocketIO from 'socket.io';
import * as http from 'http';
import { LobbyEventChannel } from './channels/lobby';
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
const logger = createLogger(mode);

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

const roomService = new RoomService(mode, lobbySocket, logger);

new App(config, logger, new LobbyEventChannel(roomService, lobbySocket, config)).start();
