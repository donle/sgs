import { WaitingRoomClientEventFinder, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerId } from 'core/player/player_props';
import { WaitingRoomInfo } from 'core/room/waiting_room';
import { Logger } from 'core/shares/libs/logger/logger';
import { Flavor } from 'core/shares/types/host_config';
import { RoomService } from 'server/services/room_service';
import SocketIO from 'socket.io';

export class WaitingRoomSocket {
  private disposeCallback: () => void;
  private connectedPlayersMap: Record<string, string> = {};
  private readonly defaultNumberOfPlayers = 8;

  constructor(
    private roomService: RoomService,
    private socket: SocketIO.Namespace,
    private flavor: Flavor,
    private logger: Logger,
    private waitingRoomInfo: WaitingRoomInfo,
  ) {
    this.socket.on('connection', socket => {
      logger.info('user ' + socket.id + ' connected');
      socket.on(WaitingRoomEvent.RoomCreated, this.onRoomCreated(socket));
      socket.on(WaitingRoomEvent.GameInfoUpdate, this.onGameInfoUpdate(socket));
      socket.on(WaitingRoomEvent.GameStart, this.onGameStart(socket));
      socket.on(WaitingRoomEvent.PlayerChatMessage, this.onSendMessage(socket));
      socket.on(WaitingRoomEvent.PlayerEnter, this.onPlayerEnter(socket));
      socket.on(WaitingRoomEvent.PlayerLeave, this.onPlayerLeave(socket));
      socket.on(WaitingRoomEvent.PlayerReady, this.onPlayerReady(socket));
      socket.on(WaitingRoomEvent.SeatDisabled, this.onSeatDisabled(socket));

      socket.on('disconnect', () => {
        logger.info('user ' + socket.id + ' disconnected');
        if (this.connectedPlayersMap[socket.id]) {
          this.broadcast(WaitingRoomEvent.PlayerLeave, {
            leftPlayerId: this.connectedPlayersMap[socket.id],
            byKicked: false,
          });
          socket.leave(this.waitingRoomInfo.roomId.toString());

          delete this.connectedPlayersMap[socket.id];
        }

        if (Object.keys(this.connectedPlayersMap).length === 0) {
          this.disposeCallback?.();
        }
      });
    });
  }

  private broadcast<Event extends WaitingRoomEvent>(e: Event, content: WaitingRoomServerEventFinder<Event>) {
    this.socket.emit(e, content);
  }

  private getAvailabeSeatId() {
    for (let i = 0; i < this.defaultNumberOfPlayers; i++) {
      if (!this.waitingRoomInfo.closedSeats.includes(i) && !this.waitingRoomInfo.players.find(p => p.seatId === i)) {
        return i;
      }
    }

    return -1;
  }

  private readonly onGameInfoUpdate = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.GameInfoUpdate>,
  ) => {
    for (const key of Object.keys(evt.roomInfo)) {
      this.waitingRoomInfo.roomInfo[key] = evt.roomInfo[key];
    }

    this.broadcast(WaitingRoomEvent.GameInfoUpdate, evt);
  };

  private readonly onGameStart = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.GameStart>,
  ) => {
    const { roomId, gameInfo } = this.roomService.createRoom(
      {
        ...evt.roomInfo,
        campaignMode: !!evt.roomInfo.campaignMode,
        flavor: this.flavor,
      },
      this.waitingRoomInfo.roomInfo,
    );

    this.broadcast(WaitingRoomEvent.GameStart, {
      roomId,
      otherPlayersId: this.waitingRoomInfo.players.map(player => player.playerId),
      roomInfo: gameInfo,
    });
  };

  private readonly onSendMessage = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerChatMessage>,
  ) => {
    this.broadcast(WaitingRoomEvent.PlayerChatMessage, { ...evt, timestamp: Date.now() });
  };

  private readonly onPlayerEnter = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerEnter>,
  ) => {
    const seatId = this.getAvailabeSeatId();
    if (
      seatId < 0 ||
      this.waitingRoomInfo.players.length > this.waitingRoomInfo.roomInfo.numberOfPlayers ||
      evt.coreVersion !== Sanguosha.Version
    ) {
      this.broadcast(WaitingRoomEvent.PlayerLeave, { leftPlayerId: evt.playerInfo.playerId, byKicked: false });
    } else {
      this.connectedPlayersMap[socket.id] = evt.playerInfo.playerId;

      const playerInfo = { ...evt.playerInfo, seatId, playerReady: false };
      this.waitingRoomInfo.players.push(playerInfo);
      this.broadcast(WaitingRoomEvent.PlayerEnter, {
        hostPlayerId: this.waitingRoomInfo.hostPlayerId,
        playerInfo,
        otherPlayersInfo: this.waitingRoomInfo.players.filter(p => p.playerId !== playerInfo.playerId),
        roomInfo: this.waitingRoomInfo.roomInfo,
        disableSeats: this.waitingRoomInfo.closedSeats,
      });
    }
  };

  private readonly onPlayerLeave = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerLeave>,
  ) => {
    this.waitingRoomInfo.players = this.waitingRoomInfo.players.filter(p => p.playerId !== evt.leftPlayerId);

    let newHostPlayerId: PlayerId | undefined;
    if (evt.leftPlayerId === this.waitingRoomInfo.hostPlayerId && this.waitingRoomInfo.players.length > 0) {
      newHostPlayerId = this.waitingRoomInfo.players[0].playerId;
    }
    this.broadcast(WaitingRoomEvent.PlayerLeave, { ...evt, byKicked: false, newHostPlayerId });
  };

  private readonly onPlayerReady = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.PlayerReady>,
  ) => {
    const player = this.waitingRoomInfo.players.find(p => p.playerId === evt.readyPlayerId);
    if (player) {
      player.playerReady = evt.isReady;
    }

    this.broadcast(WaitingRoomEvent.PlayerReady, evt);
  };

  private readonly onSeatDisabled = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.SeatDisabled>,
  ) => {
    if (evt.disabled) {
      this.waitingRoomInfo.closedSeats.push(evt.seatId);
      this.waitingRoomInfo.roomInfo.numberOfPlayers--;
    } else {
      this.waitingRoomInfo.closedSeats = this.waitingRoomInfo.closedSeats.filter(s => s !== evt.seatId);
      this.waitingRoomInfo.roomInfo.numberOfPlayers++;
    }

    if (evt.kickedPlayerId) {
      this.broadcast(WaitingRoomEvent.PlayerLeave, { leftPlayerId: evt.kickedPlayerId, byKicked: true });
      this.waitingRoomInfo.players = this.waitingRoomInfo.players.filter(p => p.playerId !== evt.kickedPlayerId);
    }

    this.broadcast(WaitingRoomEvent.SeatDisabled, evt);
  };

  private readonly onRoomCreated = (socket: SocketIO.Socket) => (
    evt: WaitingRoomClientEventFinder<WaitingRoomEvent.RoomCreated>,
  ) => {
    if (evt.roomInfo.coreVersion !== Sanguosha.Version) {
      this.broadcast(WaitingRoomEvent.RoomCreated, { error: 'unmatched core version' });
    } else {
      this.broadcast(WaitingRoomEvent.RoomCreated, {
        error: null,
        ...evt,
        roomId: this.waitingRoomInfo.roomId,
        disabledSeats: this.waitingRoomInfo.closedSeats,
      });
    }
  };

  public readonly onClosed = (disposeCallback: () => void) => {
    this.disposeCallback = disposeCallback;
  };
}
