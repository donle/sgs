import { WaitingRoomClientEventFinder, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { Logger } from 'core/shares/libs/logger/logger';

/**
 *
  WaitingRoomEvent.SeatDisabled,
  WaitingRoomEvent.SeatEnabled,
  WaitingRoomEvent.GameInfoUpdate,
  WaitingRoomEvent.PlayerEnter,
  WaitingRoomEvent.PlayerLeave,
  WaitingRoomEvent.PlayerReady,
  WaitingRoomEvent.PlayerUnready,
  WaitingRoomEvent.GameStart,
  WaitingRoomEvent.PlayerChatMessage,
 */

export type WaitingRoomInfo = {
  roomInfo: TemporaryRoomCreationInfo;
  players: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>['otherPlayersInfo'];
  closedSeats: number[];
};

export class WaitingRoomEventChannel {
  private eventHandlers: { [E in WaitingRoomEvent]?: (socket: SocketIO.Socket) => (...args: any) => void } = {};
  private waitingRooms: {
    roomId: number;
    roomInfo: TemporaryRoomCreationInfo;
    socket: SocketIO.Namespace;
    disabledSeats: number[];
  }[] = [];

  constructor(private socket: SocketIO.Server, private logger: Logger) {
    this.socket.of('/waiting-room').on('connect', socket => {
      socket.on(WaitingRoomEvent.RoomCreated, this.onRoomCreated(socket));
    });
  }

  private readonly installEventHandlers = (socket: SocketIO.Socket) => {
    for (const [eventEnum, handler] of Object.entries<(socket: SocketIO.Socket) => (...args: any) => void>(
      this.eventHandlers,
    )) {
      socket.on(eventEnum, handler(socket));
    }
  };

  readonly registerEventHandler = (
    eventEnum: WaitingRoomEvent,
    handler: (socket: SocketIO.Socket) => (...args: any) => void,
  ) => {
    this.eventHandlers[eventEnum] = handler;
  };

  private readonly onRoomCreated = (socket: SocketIO.Socket) => (
    content: WaitingRoomClientEventFinder<WaitingRoomEvent.RoomCreated>,
  ) => {
    if (content.coreVersion !== Sanguosha.Version) {
      socket.emit(WaitingRoomEvent.RoomCreated, {
        error: 'unmatched core version',
      });
      return;
    }

    const roomId = Date.now();
    const roomSocket = this.join(`/waiting-room-${roomId}`);
    roomSocket.on('disconnect', () => {
      this.waitingRooms = this.waitingRooms.filter(r => r.roomId !== roomId);
    });
    roomSocket.on('connect', socket => {
      this.installEventHandlers(socket);
    });

    this.waitingRooms.push({
      roomId,
      roomInfo: content.roomInfo,
      socket: roomSocket,
      disabledSeats: [],
    });

    socket.emit(WaitingRoomEvent.RoomCreated, {
      roomId,
      roomInfo: content.roomInfo,
      disabledSeats: [],
    });
  };

  join(channelId: string) {
    return this.socket.of(channelId);
  }
}
