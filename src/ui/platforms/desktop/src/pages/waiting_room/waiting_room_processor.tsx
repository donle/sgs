import { activeWaitingRoomListeningEvents, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { GameInfo } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { createTranslationMessages } from './messages';
import { RoomAvatarService } from './services/avatar_service';
import { WaitingRoomPresenter } from './waiting_room.presenter';
import { WaitingRoomSeatInfo, WaitingRoomStore } from './waiting_room.store';

export class WaitingRoomProcessor {
  constructor(
    private socket: SocketIOClient.Socket,
    private avatarService: RoomAvatarService,
    private translator: ClientTranslationModule,
    private presenter: WaitingRoomPresenter,
    private store: WaitingRoomStore,
    private selfPlayerName: string,
    private accessRejectedHandler: () => void,
    private joinIntoTheGame: (roomId: RoomId, roomInfo: GameInfo) => void,
  ) {}

  private messages = createTranslationMessages(this.translator);

  initWaitingRoomConnectionListeners() {
    activeWaitingRoomListeningEvents.forEach(identifier => {
      this.socket.on(identifier, (evt: WaitingRoomServerEventFinder<WaitingRoomEvent>) => {
        switch (identifier) {
          case WaitingRoomEvent.GameInfoUpdate:
            this.onGameInfoUpdate(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.GameInfoUpdate>);
            return;
          case WaitingRoomEvent.GameStart:
            this.onGameStart(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.GameStart>);
            return;
          case WaitingRoomEvent.PlayerChatMessage:
            this.onPlayerChat(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerChatMessage>);
            return;
          case WaitingRoomEvent.PlayerEnter:
            this.onPlayerEnter(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>);
            return;
          case WaitingRoomEvent.PlayerLeave:
            this.onPlayerLeave(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerLeave>);
            return;
          case WaitingRoomEvent.PlayerReady:
            this.onPlayerReady(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerReady>);
            return;
          case WaitingRoomEvent.RoomCreated:
            this.onRoomCreated(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.RoomCreated>);
            return;
          case WaitingRoomEvent.SeatDisabled:
            this.onSeatDisabled(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.SeatDisabled>);
            return;
          default:
            throw Precondition.UnreachableError(identifier);
        }
      });
    });
  }

  private onPlayerEnter(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>) {
    if (evt.playerInfo.playerId === this.store.selfPlayerId) {
      const seatsInfo: WaitingRoomSeatInfo[] = [evt.playerInfo, ...evt.otherPlayersInfo].map(playerInfo => ({
        seatDisabled: false,
        seatId: playerInfo.seatId,
        playerAvatarId: playerInfo.avatarId,
        playerId: playerInfo.playerId,
        playerName: playerInfo.playerName,
        playerReady: false,
      }));
      this.presenter.initSeatsInfo(this.store, seatsInfo);
    } else {
      this.presenter.updateSeatInfo(this.store, {
        seatDisabled: false,
        seatId: evt.playerInfo.seatId,
        playerAvatarId: evt.playerInfo.avatarId,
        playerId: evt.playerInfo.playerId,
        playerName: evt.playerInfo.playerName,
      });
    }

    this.presenter.sendChatMessage(this.store, {
      from: this.translator.tr(this.messages.systemNotification()),
      message: this.messages.playerEnter(evt.playerInfo.playerName),
      timestamp: Date.now(),
    });
  }

  private onGameInfoUpdate(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.GameInfoUpdate>) {
    const { roomName, campaignMode, coreVersion, hostPlayerId, ...settings } = evt.roomInfo;

    this.presenter.updateGameSettings(this.store, settings);
  }

  private onGameStart(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.GameStart>) {
    this.joinIntoTheGame(evt.roomId, evt.roomInfo);
  }

  private onPlayerChat(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerChatMessage>) {
    this.presenter.sendChatMessage(this.store, {
      from: evt.from,
      message: evt.messageContent,
      timestamp: evt.timestamp,
    });
  }

  private onPlayerLeave(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerLeave>) {
    const existingSeat = this.store.seats.find(seat => !seat.seatDisabled && seat.playerId === evt.leftPlayerId);
    if (!existingSeat) {
      return;
    }

    const seatInfo: WaitingRoomSeatInfo = {
      seatDisabled: false,
      seatId: existingSeat.seatId,
    };

    this.presenter.updateSeatInfo(this.store, seatInfo);
    if (!existingSeat.seatDisabled && existingSeat.playerName) {
      this.presenter.sendChatMessage(this.store, {
        from: this.translator.tr(this.messages.systemNotification()),
        message: this.messages.playerLeft(existingSeat.playerName),
        timestamp: Date.now(),
      });
    }
  }

  private onPlayerReady(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerReady>) {
    const playerSeat = this.store.seats.find(seat => !seat.seatDisabled && seat.playerId === evt.readyPlayerId);
    if (!playerSeat || playerSeat.seatDisabled) {
      return;
    }

    this.presenter.updateSeatInfo(this.store, { ...playerSeat, playerReady: evt.isReady });
  }

  private async onRoomCreated(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.RoomCreated>) {
    if (evt.error != null) {
      this.accessRejectedHandler();
    } else {
      const { roomName, campaignMode, coreVersion, hostPlayerId, ...settings } = evt.roomInfo;

      this.presenter.updateGameSettings(this.store, settings);
      this.presenter.initSeatsInfo(this.store);

      const avatarIndex = await this.avatarService.getRandomAvatarIndex();
      this.socket.emit(WaitingRoomEvent.PlayerEnter, {
        playerInfo: { playerId: this.store.selfPlayerId, avatarId: avatarIndex, playerName: this.selfPlayerName },
        isHost: true,
      });
    }
  }

  private onSeatDisabled(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.SeatDisabled>) {
    const playerSeat = this.store.seats.find(seat => seat.seatId === evt.seatId);
    if (!playerSeat) {
      return;
    }

    this.presenter.updateSeatInfo(this.store, { ...playerSeat, seatDisabled: evt.disabled });
    this.presenter.updateRoomPlayers(this.store, evt.disabled ? -1 : 1);
  }
}
