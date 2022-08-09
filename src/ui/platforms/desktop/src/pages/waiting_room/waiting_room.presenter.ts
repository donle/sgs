import { Sanguosha } from 'core/game/engine';
import { GameMode } from 'core/shares/types/room_props';
import * as mobx from 'mobx';
import { ChatPacketObject } from 'services/connection_service/connection_service';
import { WaitingRoomGameSettings, WaitingRoomSeatInfo, WaitingRoomStore } from './waiting_room.store';

export class WaitingRoomPresenter {
  static readonly defaultNumberOfPlayers = 8;
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
    store.chatMessages = [];
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
  initSeatsInfo(store: WaitingRoomStore, seatsInfo?: WaitingRoomSeatInfo[]) {
    if (seatsInfo) {
      for (const seatInfo of seatsInfo) {
        store.seats.push(seatInfo);
      }
    } else {
      for (let i = 0; i < WaitingRoomPresenter.defaultNumberOfPlayers; i++) {
        store.seats.push({
          seatDisabled: false,
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
