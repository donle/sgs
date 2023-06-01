import { WorkPlace } from 'core/event/event';
import { GameProcessor } from 'core/game/game_processor/game_processor';
import { OneVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.1v2';
import { TwoVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.2v2';
import { PveClassicGameProcessor } from 'core/game/game_processor/game_processor.pve_classic';
import { PveLongshenGameProcessor } from 'core/game/game_processor/game_processor.pve_longshen';
import { StandardGameProcessor } from 'core/game/game_processor/game_processor.standard';
import { GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { StageProcessor } from 'core/game/stage_processor';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { Logger } from 'core/shares/libs/logger/logger';
import { ServerLogger } from 'core/shares/libs/logger/server_logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { workerData, parentPort } from 'worker_threads';

const parent = Precondition.exists(parentPort, 'Unable to creat child thread');
parent.postMessage({ welcome: workerData });

export class RoomThread {
  private room: ServerRoom;
  private logger: Logger;

  constructor(
    mode: Flavor,
    gameInfo: GameInfo,
    roomId: RoomId,
    roomInfo: TemporaryRoomCreationInfo & { roomId?: number },
    waitingRoomId: number,
  ) {
    this.logger = new ServerLogger(mode);

    this.room = new ServerRoom(
      roomId,
      gameInfo,
      null,
      this.createDifferentModeGameProcessor(gameInfo.gameMode),
      new RecordAnalytics(),
      [],
      gameInfo.flavor,
      this.logger,
      gameInfo.gameMode,
      new GameCommonRules(),
      new RoomEventStacker<WorkPlace.Server>(),
      { roomInfo, roomId: waitingRoomId },
    );
  }

  private createDifferentModeGameProcessor(gameMode: GameMode): GameProcessor {
    this.logger.debug('game mode is ' + gameMode);
    switch (gameMode) {
      case GameMode.Pve:
        return new PveLongshenGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.PveClassic:
        return new PveClassicGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.OneVersusTwo:
        return new OneVersusTwoGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.TwoVersusTwo:
        return new TwoVersusTwoGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.Standard:
      default:
        return new StandardGameProcessor(new StageProcessor(this.logger), this.logger);
    }
  }

  createRoom() {}

  getRoomInfo(): RoomInfo {
    return this.roomInfo;
  }
}
