import {
  PlayerId as _PlayerId,
  PlayerInfo as _PlayerInfo,
} from 'core/player/player_props';
import { RoomInfo as _RoomInfo } from 'core/shares/types/server_types';
import * as mobx from 'mobx';

export type PlayerId = _PlayerId;
export type PlayerInfo = _PlayerInfo;
export type RoomInfo = _RoomInfo;

class RoomStore {
  @mobx.observable.struct
  roomInfo: RoomInfo;

  @mobx.observable.shallow
  players: PlayerInfo[];
}

export class RoomPresenter {
  private store: RoomStore;
  public createStore() {
    this.store = new RoomStore();
    return this.store;
  }

  private tryToThrowUninitializedError() {
    if (!this.store) {
      throw new Error('Uninitialized room store');
    }
  }

  @mobx.action
  setupRoomInfo(roomInfo: RoomInfo) {
    this.tryToThrowUninitializedError();
    this.store.roomInfo = roomInfo;
  }

  @mobx.action
  playerEnter(playerInfo: PlayerInfo) {
    this.tryToThrowUninitializedError();
    this.store.players.push(playerInfo);
  }

  @mobx.action
  playerLeave(playerId: PlayerId) {
    this.tryToThrowUninitializedError();
    const index = this.store.players.findIndex(
      player => player.Id === playerId,
    );
    if (index >= 0) {
      this.store.players.splice(index, 1);
    }
  }
}
