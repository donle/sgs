import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { PlayerCard } from '../player/player';
import styles from './seats_layout.module.css';
import { CharacterSkinInfo } from '../../../../image_loader/skins';

type SeatsLayoutProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  gamePad: JSX.Element;
  updateFlag: boolean;
  imageLoader: ImageLoader;
  skinData: CharacterSkinInfo[];
  onClick?(player: Player, selected: boolean): void;
  playerSelectableMatcher?(player?: Player): boolean;
};

@mobxReact.observer
export class SeatsLayout extends React.Component<SeatsLayoutProps> {
  private numberOfPlayers: number = this.props.store.room.Info.numberOfPlayers - 1;
  private sideNumberOfPlayers: number;
  private topNumberOfPlayers: number;

  constructor(props: SeatsLayoutProps) {
    super(props);

    this.sideNumberOfPlayers = Math.floor(this.numberOfPlayers / 3);
    this.topNumberOfPlayers = this.numberOfPlayers - this.sideNumberOfPlayers * 2;
  }

  private readonly onClick = (player?: Player) => (selected: boolean) => {
    this.props.onClick && player && this.props.onClick(player, selected);
  };

  private readonly onCloseIncomingMessage = (player: Player) => () => {
    this.props.presenter.onIncomingMessage(player.Id);
    this.forceUpdate();
  };

  @mobx.computed
  private get ClientPlayerPosition() {
    return this.props.presenter.ClientPlayer!.Position;
  }

  private getLastPosition(position: number = this.ClientPlayerPosition) {
    return --position < 0 ? this.numberOfPlayers : position;
  }

  private getNextPosition(position: number = this.ClientPlayerPosition) {
    return ++position > this.numberOfPlayers ? 0 : position;
  }

  private getTopPlayerOffsetPosition() {
    const offset = this.ClientPlayerPosition + this.sideNumberOfPlayers + 1;
    if (offset > this.numberOfPlayers) {
      return offset - this.numberOfPlayers - 1;
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
      const player = this.props.store.room.Players[playerIndex] as ClientPlayer | undefined;

      players.unshift(
        <PlayerCard
          key={playerIndex}
          imageLoader={this.props.imageLoader}
          onClick={this.onClick(player)}
          skinData={this.props.skinData}
          delight={this.props.store.delightedPlayers !== undefined ? this.props.store.delightedPlayers : undefined}
          disabled={!this.props.playerSelectableMatcher || !this.props.playerSelectableMatcher(player)}
          store={this.props.store}
          player={player}
          translator={this.props.translator}
          presenter={this.props.presenter}
          playerPhase={
            this.props.store.room.CurrentPlayer === player ? this.props.store.room.CurrentPlayerPhase : undefined
          }
          actionTimeLimit={this.props.store.notificationTime}
          inAction={player !== undefined && this.props.store.notifiedPlayers.includes(player.Id)}
          incomingMessage={player && this.props.store.incomingUserMessages[player.Id]}
          onCloseIncomingMessage={player && this.onCloseIncomingMessage(player)}
          selected={this.props.store.selectedPlayers.includes(player!)}
        />,
      );
      do {
        playerIndex = this.getLastPosition(playerIndex);
      } while (playerIndex === this.ClientPlayerPosition);
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
      const player = this.props.store.room.Players[playerIndex] as ClientPlayer | undefined;

      players.unshift(
        <PlayerCard
          key={playerIndex}
          imageLoader={this.props.imageLoader}
          onClick={this.onClick(player)}
          skinData={this.props.skinData}
          delight={this.props.store.delightedPlayers !== undefined ? this.props.store.delightedPlayers : undefined}
          disabled={!this.props.playerSelectableMatcher || !this.props.playerSelectableMatcher(player)}
          store={this.props.store}
          player={player}
          translator={this.props.translator}
          presenter={this.props.presenter}
          playerPhase={
            this.props.store.room.CurrentPlayer === player ? this.props.store.room.CurrentPlayerPhase : undefined
          }
          actionTimeLimit={this.props.store.notificationTime}
          inAction={player !== undefined && this.props.store.notifiedPlayers.includes(player.Id)}
          incomingMessage={player && this.props.store.incomingUserMessages[player.Id]}
          onCloseIncomingMessage={player && this.onCloseIncomingMessage(player)}
          selected={this.props.store.selectedPlayers.includes(player!)}
        />,
      );
      do {
        playerIndex = this.getNextPosition(playerIndex);
      } while (playerIndex === this.ClientPlayerPosition);
      numberOfPlayers--;
    }

    return players;
  }

  private getTopPlayers() {
    let playerIndex = this.getTopPlayerOffsetPosition();
    const players: JSX.Element[] = [];

    let numberOfPlayers = this.topNumberOfPlayers;
    while (numberOfPlayers > 0) {
      const player = this.props.store.room.Players[playerIndex] as ClientPlayer | undefined;

      players.unshift(
        <PlayerCard
          key={playerIndex}
          imageLoader={this.props.imageLoader}
          onClick={this.onClick(player)}
          delight={this.props.store.delightedPlayers !== undefined ? this.props.store.delightedPlayers : undefined}
          disabled={!this.props.playerSelectableMatcher || !this.props.playerSelectableMatcher(player)}
          store={this.props.store}
          player={player}
          skinData={this.props.skinData}
          translator={this.props.translator}
          presenter={this.props.presenter}
          playerPhase={
            this.props.store.room.CurrentPlayer === player ? this.props.store.room.CurrentPlayerPhase : undefined
          }
          actionTimeLimit={this.props.store.notificationTime}
          inAction={player !== undefined && this.props.store.notifiedPlayers.includes(player.Id)}
          incomingMessage={player && this.props.store.incomingUserMessages[player.Id]}
          onCloseIncomingMessage={player && this.onCloseIncomingMessage(player)}
          selected={this.props.store.selectedPlayers.includes(player!)}
        />,
      );

      do {
        playerIndex = this.getNextPosition(playerIndex);
      } while (playerIndex === this.ClientPlayerPosition);
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
