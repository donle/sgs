import {
  GameEventIdentifiers,
  ServerEventFinder as _ServerEventFinder,
} from 'core/event/event';
import {
  GameInfo as _GameInfo,
  GameRunningInfo as _GameRunningInfo,
} from 'core/game/game_props';
import { ClientSocket } from 'core/network/socket.client';
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
export type GameRunningInfo = _GameRunningInfo;
export type ServerEventFinder<
  I extends GameEventIdentifiers
> = _ServerEventFinder<I>;

export class RoomStore {
  @mobx.observable.deep
  room: ClientRoom;

  @mobx.observable.shallow
  gameLog: string[] = [];
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
  setupRoomStatus(
    event: ServerEventFinder<GameEventIdentifiers.PlayerEnterEvent>,
  ) {
    //TODO

  }

  @mobx.action
  playerEnter(playerInfo: PlayerInfo) {
    this.tryToThrowUninitializedError();

    const player = new ClientPlayer(
      playerInfo.Id,
      playerInfo.Name,
      playerInfo.Position,
      playerInfo.CharacterId,
    );
    this.store.room.addPlayer(player);
  }

  @mobx.action
  playerLeave(playerId: PlayerId) {
    this.tryToThrowUninitializedError();
    this.store.room.removePlayer(playerId);
  }

  @mobx.action
  createClientRoom(
    roomId: RoomId,
    socket: ClientSocket,
    gameInfo: GameInfo,
    playersInfo: PlayerInfo[],
  ) {
    this.tryToThrowUninitializedError();
    const players = playersInfo.map(
      playerInfo =>
        new ClientPlayer(
          playerInfo.Id,
          playerInfo.Name,
          playerInfo.Position,
          playerInfo.CharacterId,
        ),
    );

    this.store.room = new ClientRoom(
      roomId,
      socket,
      gameInfo,
      players,
    );
  }

  @mobx.action
  addGameLog(log: string) {
    this.store.gameLog.push(log);
  }
}
