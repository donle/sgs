import { activeWaitingRoomListeningEvents, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronData } from 'electron_loader/electron_data';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { createTranslationMessages } from './messages';
import { RoomAvatarService } from './services/avatar_service';
import { WaitingRoomPresenter } from './waiting_room.presenter';
import { WaitingRoomSeatInfo, WaitingRoomStore } from './waiting_room.store';

interface WaitingRoomProcessorListenerData {
  [WaitingRoomEvent.PlayerEnter]: { roomInfo: TemporaryRoomCreationInfo };
  hostChange: { newHostPlayerId: PlayerId };
}

export class WaitingRoomProcessor {
  constructor(
    private socket: SocketIOClient.Socket,
    private avatarService: RoomAvatarService,
    private translator: ClientTranslationModule,
    private electronLoader: ElectronLoader,
    private presenter: WaitingRoomPresenter,
    private store: WaitingRoomStore,
    private selfPlayerName: string,
    private accessRejectedHandler: () => void,
    private joinIntoTheGame: (roomId: RoomId, roomInfo: GameInfo) => void,
  ) {}

  private messages = createTranslationMessages(this.translator);

  private playerEnterListener: (content: WaitingRoomProcessorListenerData[WaitingRoomEvent.PlayerEnter]) => void;
  private hostChangedListener: (content: WaitingRoomProcessorListenerData['hostChange']) => void;

  public on<Event extends WaitingRoomEvent.PlayerEnter | 'hostChange'>(
    event: Event,
    listener: (content: WaitingRoomProcessorListenerData[Event]) => void,
  ) {
    switch (event) {
      case WaitingRoomEvent.PlayerEnter: {
        this.playerEnterListener = listener as any;
        break;
      }
      case 'hostChange': {
        this.hostChangedListener = listener as any;
        break;
      }

      default:
        return;
    }
  }

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
          case WaitingRoomEvent.ChangeHost:
            this.onHostChanged(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.ChangeHost>);
            return;
          default:
            throw Precondition.UnreachableError(identifier);
        }
      });
    });
  }

  public saveSettingsLocally() {
    this.electronLoader.setData(ElectronData.RoomSettingsAllowObserver, this.store.gameSettings.allowObserver || false);
    this.electronLoader.setData(ElectronData.RoomSettingsCardExtensions, this.store.gameSettings.cardExtensions);
    this.electronLoader.setData(
      ElectronData.RoomSettingsCharacterExtensions,
      this.store.gameSettings.characterExtensions,
    );
    this.electronLoader.setData(ElectronData.RoomSettingsGameMode, this.store.gameSettings.gameMode);
    this.electronLoader.setData(ElectronData.RoomSettingsPlayTime, this.store.gameSettings.playingTimeLimit);
    this.electronLoader.setData(ElectronData.RoomSettingsWuxiekejiTime, this.store.gameSettings.wuxiekejiTimeLimit);
    this.electronLoader.setData(
      ElectronData.RoomSettingsFortuneCardsExchangeTime,
      this.store.gameSettings.fortuneCardsExchangeLimit,
    );
    this.electronLoader.setData(
      ElectronData.RoomSettingsDisabledCharacters,
      this.store.gameSettings.excludedCharacters,
    );
  }

  private onPlayerEnter(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>) {
    const seatsInfo: WaitingRoomSeatInfo[] = [];
    if (evt.playerInfo.playerId === this.store.selfPlayerId) {
      const playersInfo: {
        playerId: string;
        avatarId: number;
        playerName: string;
        seatId: number;
        playerReady?: boolean;
      }[] = [evt.playerInfo, ...evt.otherPlayersInfo];
      for (let i = 0; i < WaitingRoomPresenter.defaultNumberOfPlayers; i++) {
        if (!evt.disableSeats.includes(i)) {
          const seatInfo = playersInfo.shift();
          if (seatInfo) {
            seatsInfo.push({
              seatDisabled: false,
              seatId: seatInfo.seatId,
              playerAvatarId: seatInfo.avatarId,
              playerId: seatInfo.playerId,
              playerName: seatInfo.playerName,
              playerReady: seatInfo.playerReady || false,
            });
          } else {
            seatsInfo.push({ seatDisabled: false, seatId: i });
          }
        } else {
          seatsInfo.push({ seatDisabled: true, seatId: i });
        }
      }

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
      from: this.messages.systemNotification(),
      message: this.messages.playerEnter(evt.playerInfo.playerName),
      timestamp: Date.now(),
    });

    if (this.store.selfPlayerId === evt.playerInfo.playerId) {
      this.playerEnterListener?.({ roomInfo: evt.roomInfo });
    }
  }

  private onGameInfoUpdate(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.GameInfoUpdate>) {
    this.presenter.updateGameSettings(this.store, evt.roomInfo);
    this.saveSettingsLocally();
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
    if (evt.leftPlayerId === this.store.selfPlayerId) {
      return this.accessRejectedHandler();
    }

    const existingSeat = this.store.seats.find(seat => !seat.seatDisabled && seat.playerId === evt.leftPlayerId);
    if (!existingSeat) {
      return;
    }

    if (evt.newHostPlayerId != null) {
      this.hostChangedListener?.({ newHostPlayerId: evt.newHostPlayerId });
    }

    const seatInfo: WaitingRoomSeatInfo = {
      seatDisabled: false,
      seatId: existingSeat.seatId,
    };

    this.presenter.updateSeatInfo(this.store, seatInfo);
    if (!existingSeat.seatDisabled && existingSeat.playerName) {
      this.presenter.sendChatMessage(this.store, {
        from: this.messages.systemNotification(),
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
      this.saveSettingsLocally();

      this.presenter.initSeatsInfo(this.store);

      const avatarIndex = await this.avatarService.getRandomAvatarIndex();
      this.socket.emit(WaitingRoomEvent.PlayerEnter, {
        playerInfo: { playerId: this.store.selfPlayerId, avatarId: avatarIndex, playerName: this.selfPlayerName },
        isHost: true,
        coreVersion,
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

  private onHostChanged(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.ChangeHost>) {
    this.hostChangedListener?.({ newHostPlayerId: evt.newHostPlayerId });
    this.presenter.sendChatMessage(this.store, {
      from: this.messages.systemNotification(),
      message: this.messages.roomHostChanged(this.selfPlayerName),
      timestamp: Date.now(),
    });
  }
}
