import * as mobx from 'mobx';
import { WaitingRoomGameSettings, WaitingRoomSeatInfo, WaitingRoomStore } from './waiting_room.store';

export class WaitingRoomPresenter {
  createStore() {
    return new WaitingRoomStore();
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
