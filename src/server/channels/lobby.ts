import { Sanguosha } from 'core/game/engine';
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
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { Logger } from 'core/shares/libs/logger/logger';
import { GameMode } from 'core/shares/types/room_props';
import { ChatSocketEvent, LobbySocketEvent } from 'core/shares/types/server_types';
import { ServerConfig } from 'server/server_config';

export class LobbyEventChannel {
  private eventHandlers: { [E in LobbySocketEvent]?: (socket: SocketIO.Socket) => (...args: any) => void } = {};
  private rooms: ServerRoom[] = [];

  constructor(private socket: SocketIO.Server, private logger: Logger, private config: ServerConfig) {
    this.socket.of('/chat').on('connect', socket => {
      socket.on(ChatSocketEvent.Chat, this.onGameChat);
    });

    this.registerEventHandler(LobbySocketEvent.GameCreated, this.onGameCreated);
    this.registerEventHandler(LobbySocketEvent.QueryRoomList, this.onQueryRoomsInfo);
    this.registerEventHandler(LobbySocketEvent.QueryVersion, this.matchCoreVersion);
    this.registerEventHandler(LobbySocketEvent.CheckRoomExist, this.onCheckingRoomExist);
  }

  start() {
    this.socket.of('/lobby').on('connect', socket => {
      this.installEventHandlers(socket);
      socket.on(LobbySocketEvent.PingServer.toString(), () => {
        socket.emit(LobbySocketEvent.PingServer.toString());
      });
    });
  }

  private readonly installEventHandlers = (socket: SocketIO.Socket) => {
    for (const [eventEnum, handler] of Object.entries<(socket: SocketIO.Socket) => (...args: any) => void>(
      this.eventHandlers,
    )) {
      socket.on(eventEnum, handler(socket));
    }
  };

  private readonly onGameChat = (message: any) => {
    this.socket.of('/chat').emit(ChatSocketEvent.Chat, message);
  };

  readonly registerEventHandler = (
    eventEnum: LobbySocketEvent,
    handler: (socket: SocketIO.Socket) => (...args: any) => void,
  ) => {
    this.eventHandlers[eventEnum] = handler;
  };

  private readonly matchCoreVersion = (socket: SocketIO.Socket) => (content: { version: string }) => {
    socket.emit(LobbySocketEvent.VersionMismatch.toString(), content.version === Sanguosha.Version);
  };

  private readonly onCheckingRoomExist = (socket: SocketIO.Socket) => (id: RoomId) => {
    socket.emit(LobbySocketEvent.CheckRoomExist.toString(), this.rooms.find(room => room.RoomId === id) !== undefined);
  };

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

  private readonly onGameCreated = (socket: SocketIO.Socket) => (content: GameInfo) => {
    if (content.coreVersion !== Sanguosha.Version) {
      socket.emit(LobbySocketEvent.GameCreated.toString(), {
        error: 'unmatched core version',
      });
      return;
    }

    const roomId = Date.now();
    const roomSocket = new ServerSocket(this.join(`/room-${roomId}`), roomId, this.logger);
    const room = new ServerRoom(
      roomId,
      content,
      roomSocket,
      this.createDifferentModeGameProcessor(content.gameMode),
      new RecordAnalytics(),
      [],
      this.config.mode,
      this.logger,
      content.gameMode,
      new GameCommonRules(),
      new RoomEventStacker(),
    );

    room.onClosed(() => {
      this.rooms = this.rooms.filter(r => r !== room);
    });

    this.rooms.push(room);
    socket.emit(LobbySocketEvent.GameCreated.toString(), {
      roomId,
      roomInfo: content,
    });
  };

  private readonly onQueryRoomsInfo = (socket: SocketIO.Socket) => () => {
    const roomsInfo = this.rooms.map(room => room.getRoomInfo());
    socket.emit(LobbySocketEvent.QueryRoomList.toString(), roomsInfo);
  };

  join(channelId: string) {
    return this.socket.of(channelId);
  }
}
