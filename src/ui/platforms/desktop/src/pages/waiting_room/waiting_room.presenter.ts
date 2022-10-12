import { Sanguosha } from 'core/game/engine';
import { WaitingRoomGameSettings } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { GameMode } from 'core/shares/types/room_props';
import * as mobx from 'mobx';
import { ChatPacketObject } from 'services/connection_service/connection_service';
import { WaitingRoomSeatInfo, WaitingRoomStore } from './waiting_room.store';

export class WaitingRoomPresenter {
  static readonly defaultNumberOfPlayers = 8;
  createStore(playerId: PlayerId, defaultSettings?: WaitingRoomGameSettings) {
    const store = new WaitingRoomStore(playerId);
    this.initGameSettings(store, defaultSettings);
    return store;
  }

  @mobx.action
  private initGameSettings(store: WaitingRoomStore, defaultSettings?: WaitingRoomGameSettings) {
    store.gameSettings = {
      gameMode: GameMode.Standard,
      cardExtensions: Sanguosha.getCardExtensionsFromGameMode(GameMode.Standard),
      characterExtensions: Sanguosha.getGameCharacterExtensions(),
      excludedCharacters: [],
      numberOfPlayers: WaitingRoomPresenter.defaultNumberOfPlayers,
      playingTimeLimit: 60,
      wuxiekejiTimeLimit: 15,
      allowObserver: false,
      pveNumberOfPlayers: 3,
      ...defaultSettings,
    };

    store.chatMessages = [];
  }

  @mobx.action
  updateGameSettings(store: WaitingRoomStore, newGameSettings: Partial<WaitingRoomGameSettings>) {
    for (const key of Object.keys(newGameSettings)) {
      store.gameSettings[key] = newGameSettings[key];
    }
  }

  @mobx.action
  updateSeatInfo(store: WaitingRoomStore, seatInfo: WaitingRoomSeatInfo) {
    for (let i = 0; i < store.seats.length; i++) {
      if (store.seats[i].seatId === seatInfo.seatId) {
        store.seats[i] = JSON.parse(JSON.stringify(seatInfo));
        break;
      }
    }
  }

  @mobx.action
  updateRoomPlayers(store: WaitingRoomStore, addPlayers: number) {
    store.gameSettings.numberOfPlayers += addPlayers;
  }

  @mobx.action
  disableSeat(store: WaitingRoomStore, seatId: number) {
    const seat = store.seats.find(s => s.seatId === seatId);
    if (seat) {
      seat.seatDisabled = true;
    }
  }

  @mobx.action
  initSeatsInfo(store: WaitingRoomStore, seatsInfo?: WaitingRoomSeatInfo[]) {
    if (seatsInfo) {
      const newSeats: WaitingRoomSeatInfo[] = [];
      for (let i = 0; i < store.seats.length; i++) {
        const seat = seatsInfo.find(s => s.seatId === i);
        newSeats.push(seat || store.seats[i]);
      }
      store.seats = newSeats;
    } else {
      for (let i = 0; i < WaitingRoomPresenter.defaultNumberOfPlayers; i++) {
        store.seats.push({
          seatDisabled: store.gameSettings.numberOfPlayers - i > 0 ? false : true,
          seatId: i,
        });
      }
    }
  }

  @mobx.action
  sendChatMessage(store: WaitingRoomStore, message: ChatPacketObject) {
    store.chatMessages.push(message);
  }
}
