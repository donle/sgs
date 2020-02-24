import { WorkPlace } from 'core/event/event';
import {
  GameInfo as _GameInfo,
  GameStartInfo as _GameStartInfo,
} from 'core/game/game_props';
import { Socket } from 'core/network/socket';
import { ClientPlayer } from 'core/player/player.client';
import {
  PlayerId as _PlayerId,
  PlayerInfo as _PlayerInfo,
} from 'core/player/player_props';
import { RoomId as _RoomId } from 'core/room/room';
import { ClientRoom } from 'core/room/room.client';
import { RoomInfo as _RoomInfo } from 'core/shares/types/server_types';
import * as mobx from 'mobx';

export type PlayerId = _PlayerId;
export type PlayerInfo = _PlayerInfo;
export type RoomInfo = _RoomInfo;
export type RoomId = _RoomId;
export type GameInfo = _GameInfo;
export type GameStartInfo = _GameStartInfo;

export class RoomStore {
  @mobx.observable.struct
  roomInfo: RoomInfo;

  @mobx.observable.shallow
  players: PlayerInfo[];

  @mobx.observable.deep
  room: ClientRoom;
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

  @mobx.action
  createClientRoom(
    roomId: RoomId,
    socket: Socket<WorkPlace.Client>,
    gameInfo: GameInfo,
    gameStartInfo: GameStartInfo,
  ) {
    this.tryToThrowUninitializedError();

    this.store.room = new ClientRoom(
      roomId,
      socket,
      gameInfo,
      this.store.players.map(
        playerInfo =>
          new ClientPlayer(
            playerInfo.Id,
            playerInfo.Name,
            playerInfo.Position,
            playerInfo.CharacterId,
          ),
      ),
      gameStartInfo,
    );
  }
}
