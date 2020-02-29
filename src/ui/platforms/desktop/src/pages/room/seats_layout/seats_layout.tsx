import { Player } from 'core/player/player';
import { Translation } from 'core/translations/translation_json_tool';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { PlayerCard } from '../player/player';
import { RoomPresenter, RoomStore } from '../room.presenter';
import styles from './seats_layout.module.css';

type SeatsLayoutProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: Translation;
  gamePad: JSX.Element;
  updateFlag: boolean;
  onClick?(player: Player, selected: boolean): void;
  playerSelectableMatcher?(player: Player): boolean;
};

@mobxReact.observer
export class SeatsLayout extends React.Component<SeatsLayoutProps> {
  private numberOfPlayers: number =
    this.props.store.room.Info.numberOfPlayers - 1;
  private sideNumberOfPlayers: number;
  private topNumberOfPlayers: number;

  constructor(props: SeatsLayoutProps) {
    super(props);

    this.sideNumberOfPlayers = Math.floor(this.numberOfPlayers / 3);
    this.topNumberOfPlayers =
      this.sideNumberOfPlayers + Math.floor(this.numberOfPlayers % 3);
  }

  private readonly onClick = (player: Player) => (selected: boolean) => {
    this.props.onClick && this.props.onClick(player, selected);
  };

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
    const offset = this.ClientPlayerPosition - this.sideNumberOfPlayers - 1;
    if (offset < 0) {
      return this.numberOfPlayers + 1 + offset;
    } else {
      return offset;
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
      const player = this.props.store.room.Players[playerIndex];

      players.push(
        <PlayerCard
          key={playerIndex}
          onClick={this.onClick(player)}
          disabled={
            !this.props.playerSelectableMatcher ||
            !this.props.playerSelectableMatcher(player)
          }
          player={player}
          translator={this.props.translator}
        />,
      );
      playerIndex = this.getLastPosition(playerIndex);
      numberOfPlayers--;
    }

    return players;
  }
  private getRightPlayers() {
    let numberOfPlayers = this.sideNumberOfPlayers;
    const players: JSX.Element[] = [];
    if (this.ClientPlayerPosition === undefined) {
      return;
    }

    let playerIndex = this.getNextPosition();
    while (numberOfPlayers > 0) {
      const player = this.props.store.room.Players[playerIndex];

      players.unshift(
        <PlayerCard
          key={playerIndex}
          onClick={this.onClick(player)}
          disabled={
            !this.props.playerSelectableMatcher ||
            !this.props.playerSelectableMatcher(player)
          }
          player={player}
          translator={this.props.translator}
        />,
      );
      playerIndex = this.getNextPosition(playerIndex);
      numberOfPlayers--;
    }

    return players;
  }

  private getTopPlayers() {
    let playerIndex = this.getTopPlayerOffsetPosition();
    const players: JSX.Element[] = [];

    let numberOfPlayers = this.topNumberOfPlayers;
    while (numberOfPlayers > 0) {
      const player = this.props.store.room.Players[playerIndex];

      players.push(
        <PlayerCard
          key={playerIndex}
          onClick={this.onClick(player)}
          disabled={
            !this.props.playerSelectableMatcher ||
            !this.props.playerSelectableMatcher(player)
          }
          player={player}
          translator={this.props.translator}
        />,
      );
      playerIndex = this.getNextPosition(playerIndex);
      numberOfPlayers--;
    }

    return players;
  }

  render() {
    return (
      <div className={styles.seatsLayout}>
        <div className={styles.leftSeats}>{this.getLeftPlayers()}</div>
        <div className={styles.central}>
          <div className={styles.topSeats}>{this.getTopPlayers()}</div>
          <div className={styles.gamePad}>{this.props.gamePad}</div>
        </div>
        <div className={styles.rightSeats}>{this.getRightPlayers()}</div>
      </div>
    );
  }
}
