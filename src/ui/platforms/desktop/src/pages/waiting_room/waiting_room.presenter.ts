import { Sanguosha } from 'core/game/engine';
import { PlayerId } from 'core/player/player_props';
import { GameMode } from 'core/shares/types/room_props';
import * as mobx from 'mobx';
import { ChatPacketObject } from 'services/connection_service/connection_service';
import { WaitingRoomGameSettings, WaitingRoomSeatInfo, WaitingRoomStore } from './waiting_room.store';

export class WaitingRoomPresenter {
  static readonly defaultNumberOfPlayers = 8;
  createStore(playerId: PlayerId, defaultSettings?: WaitingRoomGameSettings) {
    const store = new WaitingRoomStore(playerId);
    this.initGameSettings(store, defaultSettings);
    return store;
  }

  @mobx.action
  private initGameSettings(store: WaitingRoomStore, defaultSettings?: WaitingRoomGameSettings) {
    store.gameSettings = defaultSettings || {
      gameMode: GameMode.Standard,
      cardExtensions: Sanguosha.getCardExtensionsFromGameMode(GameMode.Standard),
      characterExtensions: Sanguosha.getGameCharacterExtensions(),
      numberOfPlayers: WaitingRoomPresenter.defaultNumberOfPlayers,
    };

    store.gameSettings.playingTimeLimit = store.gameSettings.playingTimeLimit || 60;
    store.gameSettings.wuxiekejiTimeLimit = store.gameSettings.wuxiekejiTimeLimit || 15;
    store.gameSettings.allowObserver = store.gameSettings.allowObserver || false;
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
      for (const seatInfo of seatsInfo) {
        const seatIndex = store.seats.findIndex(s => s.seatId === seatInfo.seatId);
        if (seatIndex >= 0) {
          store.seats.splice(seatIndex, 1, seatInfo);
        }
      }
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
