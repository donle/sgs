import { Sanguosha } from 'core/game/engine';
import { GameMode } from 'core/shares/types/room_props';
import * as mobx from 'mobx';
import { WaitingRoomGameSettings, WaitingRoomSeatInfo, WaitingRoomStore } from './waiting_room.store';

export class WaitingRoomPresenter {
  createStore() {
    const store = new WaitingRoomStore();
    this.initGameSettings(store);
    return store;
  }

  @mobx.action
  private initGameSettings(store: WaitingRoomStore) {
    store.gameSettings = {
      gameMode: GameMode.Standard,
      cardExtensions: Sanguosha.getCardExtensionsFromGameMode(GameMode.Standard),
      characterExtensions: Sanguosha.getGameCharacterExtensions(),
      playingTimeLimit: 60,
      wuxiekejiTimeLimit: 15,
      allowObserver: false,
    };
  }

  @mobx.action
  updateGameSettings(store: WaitingRoomStore, newGameSettings: WaitingRoomGameSettings) {
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
  initSeatsInfo(store: WaitingRoomStore) {
    for (let i = 0; i < 8; i++) {
      store.seats.push({
        seatDisabled: false,
        seatId: i,
      });
    }
  }
}
