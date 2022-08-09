import { WaitingRoomClientEventFinder, WaitingRoomEvent } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { WaitingRoomInfo } from 'core/room/waiting_room';
import { Logger } from 'core/shares/libs/logger/logger';
import { Flavor } from 'core/shares/types/host_config';
import { RoomService } from 'server/services/room_service';
import SocketIO from 'socket.io';

export class WaitingRoomSocket {
  private disposeCallback: () => void;
  private connectedPlayersMap: Record<string, string> = {};

  constructor(
    private roomService: RoomService,
    private socket: SocketIO.Namespace,
    private flavor: Flavor,
    private logger: Logger,
    private waitingRoomInfo: WaitingRoomInfo,
  ) {
    this.socket.on('connection', socket => {
      socket.on(WaitingRoomEvent.RoomCreated, this.onRoomCreated(socket));
      socket.on(WaitingRoomEvent.GameInfoUpdate, this.onGameInfoUpdate(socket));
      socket.on(WaitingRoomEvent.GameStart, this.onGameStart(socket));
      socket.on(WaitingRoomEvent.PlayerChatMessage, this.onSendMessage(socket));
      socket.on(WaitingRoomEvent.PlayerEnter, this.onPlayerEnter(socket));
      socket.on(WaitingRoomEvent.PlayerLeave, this.onPlayerLeave(socket));
      socket.on(WaitingRoomEvent.PlayerReady, this.onPlayerReady(socket));
      socket.on(WaitingRoomEvent.SeatDisabled, this.onSeatDisabled(socket));

      socket.on('disconnect', () => {
        if (this.connectedPlayersMap[socket.id]) {
          socket.emit(WaitingRoomEvent.PlayerLeave, {
            playerId: this.connectedPlayersMap[socket.id],
          });
        }
      });
    });
    this.socket.on('disconnection', () => {
      this.disposeCallback?.();
    });
  }

  private getAvailabeSeatId() {
    for (let i = 0; i < this.waitingRoomInfo.roomInfo.numberOfPlayers; i++) {
      if (!this.waitingRoomInfo.closedSeats.includes(i)) {
        return i;
      }
    }

    return -1;
  }

  private readonly onGameInfoUpdate = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.GameInfoUpdate>,
  ) => {
    socket.emit(WaitingRoomEvent.GameInfoUpdate, evt);
  };

  private readonly onGameStart = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.GameStart>,
  ) => {
    const { roomId, gameInfo } = this.roomService.createRoom({
      ...evt.roomInfo,
      campaignMode: !!evt.roomInfo.campaignMode,
      flavor: this.flavor,
    });
    socket.emit(WaitingRoomEvent.GameStart, {
      roomId,
      otherPlayersId: this.waitingRoomInfo.players.map(player => player.playerId),
      roomInfo: gameInfo,
    });
  };

  private readonly onSendMessage = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerChatMessage>,
  ) => {
    socket.emit(WaitingRoomEvent.PlayerChatMessage, { ...evt, timestamp: Date.now() });
  };

  private readonly onPlayerEnter = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerEnter>,
  ) => {
    const seatId = this.getAvailabeSeatId();
    if (
      seatId < 0 ||
      this.waitingRoomInfo.players.length + this.waitingRoomInfo.closedSeats.length >=
        this.waitingRoomInfo.roomInfo.numberOfPlayers
    ) {
      socket.emit(WaitingRoomEvent.PlayerLeave, { playerId: evt.playerInfo.playerId });
    } else {
      this.connectedPlayersMap[socket.id] = evt.playerInfo.playerId;

      const playerInfo = { ...evt.playerInfo, seatId };
      this.waitingRoomInfo.players.push(playerInfo);
      socket.emit(WaitingRoomEvent.PlayerEnter, {
        playerInfo,
        otherPlayersInfo: this.waitingRoomInfo.players.filter(p => p.playerId !== playerInfo.playerId),
        roomInfo: this.waitingRoomInfo.roomInfo,
      });
    }
  };

  private readonly onPlayerLeave = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerLeave>,
  ) => {
    socket.emit(WaitingRoomEvent.PlayerLeave, { ...evt, byKicked: false });
  };

  private readonly onPlayerReady = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerReady>,
  ) => {
    socket.emit(WaitingRoomEvent.PlayerReady, evt);
  };

  private readonly onSeatDisabled = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.SeatDisabled>,
  ) => {
    if (evt.kickedPlayerId) {
      socket.emit(WaitingRoomEvent.PlayerLeave, { leftPlayerId: evt.kickedPlayerId, byKicked: true });
    }

    socket.emit(WaitingRoomEvent.SeatDisabled, evt);
  };

  private readonly onRoomCreated = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.RoomCreated>,
  ) => {
    if (evt.roomInfo.coreVersion !== Sanguosha.Version) {
      socket.emit(WaitingRoomEvent.RoomCreated, { error: 'unmatched core version' });
    } else {
      socket.emit(WaitingRoomEvent.SeatDisabled, evt);
    }
  };

  public readonly onClosed = (disposeCallback: () => void) => {
    this.disposeCallback = disposeCallback;
  };
}
