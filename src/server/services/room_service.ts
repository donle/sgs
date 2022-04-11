import { WorkPlace } from 'core/event/event';
import { GameProcessor } from 'core/game/game_processor/game_processor';
import { OneVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.1v2';
import { TwoVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.2v2';
import { PveGameProcessor } from 'core/game/game_processor/game_processor.pve';
import { StandardGameProcessor } from 'core/game/game_processor/game_processor.standard';
import { GameInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { StageProcessor } from 'core/game/stage_processor';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { Logger } from 'core/shares/libs/logger/logger';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { RoomInfo } from 'core/shares/types/server_types';
import SocketIO from 'socket.io';

export class RoomService {
  private rooms: ServerRoom[] = [];

  constructor(
    private createServerSocket: (roomChannel: SocketIO.Namespace, roomId: RoomId, logger: Logger) => ServerSocket,
    private createServerRoom: (
      roomId: RoomId,
      gameInfo: GameInfo,
      socket: ServerSocket,
      gameProcessor: GameProcessor,
      analytics: RecordAnalytics,
      players: Player[],
      flavor: Flavor,
      logger: Logger,
      gameMode: GameMode,
      gameCommonRules: GameCommonRules,
      eventStack: RoomEventStacker<WorkPlace.Server>,
    ) => ServerRoom,
    private createRecordAnalytics: () => RecordAnalytics,
    private createGameCommonRules: () => GameCommonRules,
    private createRoomEventStacker: () => RoomEventStacker<WorkPlace.Server>,
    private logger: Logger,
  ) {}

  private readonly createDifferentModeGameProcessor = (gameMode: GameMode): GameProcessor => {
    this.logger.debug('game mode is ' + gameMode);
    switch (gameMode) {
      case GameMode.Pve:
        return new PveGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.OneVersusTwo:
        return new OneVersusTwoGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.TwoVersusTwo:
        return new TwoVersusTwoGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.Standard:
      default:
        return new StandardGameProcessor(new StageProcessor(this.logger), this.logger);
    }
  };

  checkRoomExist(roomId: RoomId) {
    return this.rooms.find(room => room.RoomId === roomId) !== undefined;
  }

  getRoomsInfo(): ReadonlyArray<RoomInfo> {
    return this.rooms.map(room => room.getRoomInfo());
  }

  createRoom(roomChannel: SocketIO.Namespace, gameInfo: GameInfo, mode: Flavor) {
    const roomId = Date.now();
    const roomSocket = this.createServerSocket(roomChannel, roomId, this.logger);
    const room = this.createServerRoom(
      roomId,
      gameInfo,
      roomSocket,
      this.createDifferentModeGameProcessor(gameInfo.gameMode),
      this.createRecordAnalytics(),
      [],
      mode,
      this.logger,
      gameInfo.gameMode,
      this.createGameCommonRules(),
      this.createRoomEventStacker(),
    );

    room.onClosed(() => {
      this.rooms = this.rooms.filter(r => r !== room);
    });

    this.rooms.push(room);
  }
}
