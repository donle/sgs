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

import * as React from 'react';
import styles from './room.module.css';

export type PlayerId = _PlayerId;
export type PlayerInfo = _PlayerInfo;
export type RoomInfo = _RoomInfo;
export type RoomId = _RoomId;
export type GameInfo = _GameInfo;
export type GameRunningInfo = _GameRunningInfo;
export type ServerEventFinder<
  I extends GameEventIdentifiers
> = _ServerEventFinder<I>;

type ClientRoomInfo = {
  roomId: number;
  playerName: string;
  socket: ClientSocket;
  timestamp: number;
};

export class RoomStore {
  @mobx.observable.ref
  clientRoomInfo: ClientRoomInfo;
  @mobx.observable.deep
  room: ClientRoom;

  @mobx.observable.ref
  clientPlayerId: PlayerId;

  @mobx.observable.ref
  gameDialog: JSX.Element | undefined;

  @mobx.observable.shallow
  gameLog: string[] = [];

  @mobx.observable.ref
  updateStatus: boolean = false;
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
  update() {
    this.store.updateStatus = !this.store.updateStatus;
  }

  @mobx.action
  setupRoomStatus(info: ClientRoomInfo) {
    this.store.clientRoomInfo = info;
  }

  @mobx.action
  setupClientPlayerId(playerId: PlayerId) {
    this.store.clientPlayerId = playerId;
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
    this.update();
  }

  @mobx.action
  playerLeave(playerId: PlayerId) {
    this.tryToThrowUninitializedError();
    if (this.store.room.isPlaying()) {
      this.store.room.getPlayerById(playerId).offline();
    } else {
      this.store.room.removePlayer(playerId);
    }
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

    this.store.room = new ClientRoom(roomId, socket, gameInfo, players);
    this.update();
  }

  @mobx.action
  addGameLog(log: string) {
    this.store.gameLog.push(log);
  }

  @mobx.action
  createDialog(title: string | JSX.Element, content: JSX.Element) {
    this.store.gameDialog = (
      <div className={styles.gameDialog}>
        {typeof title === 'string' ? (
          <h4 dangerouslySetInnerHTML={{ __html: title }} />
        ) : (
          <h4>{title}</h4>
        )}
        {content}
      </div>
    );
  }

  @mobx.action
  closeDialog() {
    this.store.gameDialog = undefined;
  }
}
