import { Translation } from 'core/translations/translation_json_tool';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { PlayerCard } from '../player/player';
import { RoomPresenter, RoomStore } from '../room.presenter';

type SeatsLayoutProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: Translation;
};

@mobxReact.observer
export class SeatsLayout extends React.Component<SeatsLayoutProps> {
  private numberOfPlayers: number = this.props.store.room.Players.length;
  private sideNumberOfPlayers: number;
  private topNumberOfPlayers: number;

  constructor(props: SeatsLayoutProps) {
    super(props);

    this.sideNumberOfPlayers = Math.floor(this.numberOfPlayers / 3);
    this.topNumberOfPlayers =
      this.sideNumberOfPlayers + Math.floor(this.numberOfPlayers % 3);
  }

  @mobx.computed
  private get ClientPlayerPosition() {
    return this.props.store.room.Players.find(
      player => player.Id === this.props.store.clientPlayerId,
    )!.Position;
  }

  private getLastPosition(position: number = this.ClientPlayerPosition) {
    return --position < 0 ? this.numberOfPlayers - 1 : position;
  }

  private getNextPosition(position: number = this.ClientPlayerPosition) {
    return ++position >= this.numberOfPlayers ? 0 : position;
  }

  private getTopPlayerOffsetPosition() {
    const offset = this.sideNumberOfPlayers + 1;
    if (offset > this.ClientPlayerPosition) {
      return this.numberOfPlayers - (offset - this.ClientPlayerPosition);
    } else {
      return this.ClientPlayerPosition - offset;
    }
  }

  private getLeftPlayers() {
    let numberOfPlayers = this.sideNumberOfPlayers;
    const players: JSX.Element[] = [];
    if (this.ClientPlayerPosition === undefined) {
      return;
    }

    let playerIndex = this.getLastPosition();
    while (numberOfPlayers > 0) {
      players.push(
        <PlayerCard
          player={this.props.store.room.Players[playerIndex]}
          translator={this.props.translator}
        />,
      );
      playerIndex = this.getLastPosition(playerIndex);
      numberOfPlayers--;
    }
  }
  private getRightPlayers() {
    let numberOfPlayers = this.sideNumberOfPlayers;
    const players: JSX.Element[] = [];
    if (this.ClientPlayerPosition === undefined) {
      return;
    }

    let playerIndex = this.getNextPosition();
    while (numberOfPlayers > 0) {
      players.unshift(
        <PlayerCard
          player={this.props.store.room.Players[playerIndex]}
          translator={this.props.translator}
        />,
      );
      playerIndex = this.getNextPosition(playerIndex);
      numberOfPlayers--;
    }
  }

  private getTopPlayers() {
    let playerIndex = this.getTopPlayerOffsetPosition();
    const players: JSX.Element[] = [];

    let numberOfPlayers = this.topNumberOfPlayers;
    while (numberOfPlayers > 0) {
      players.push(
        <PlayerCard
          player={this.props.store.room.Players[playerIndex]}
          translator={this.props.translator}
        />,
      );
      playerIndex = this.getNextPosition(playerIndex);
      numberOfPlayers--;
    }
  }
}
