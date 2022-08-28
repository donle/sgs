import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { PlayerId } from 'core/player/player_props';
import { GameMode } from 'core/shares/types/room_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Picture } from 'ui/picture/picture';
import { RoomAvatarService } from '../services/avatar_service';
import { WaitingRoomSender } from '../services/sender_service';
import { StatusBadge } from '../status_badge/status_badge';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomSeatInfo, WaitingRoomStore } from '../waiting_room.store';
import { Messages } from './messages';
import styles from './seats.module.css';

export type SeatsProps = {
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
  avatarService: RoomAvatarService;
  senderService: WaitingRoomSender;
  className?: string;
  validToStartGame: boolean;
  isHost: boolean;
  hostPlayerId: PlayerId;
  roomName: string;
};

@mobxReact.observer
class ClickableSeat extends React.Component<{
  imageLoader: ImageLoader;
  seatInfo: WaitingRoomSeatInfo;
  avatarService: RoomAvatarService;
  translator: ClientTranslationModule;
  onClick(closeSeat: boolean, seatId: number, kickedPlayerId?: string): void;
  selfPlayerId: PlayerId;
  clickable: boolean;
}> {
  @mobx.observable.ref
  private characterAvatar = this.props.imageLoader.getEmptySeatImage();

  private readonly onClick = () => {
    if (!this.props.clickable) {
      return;
    }

    this.props.onClick(
      !this.props.seatInfo.seatDisabled,
      this.props.seatInfo.seatId,
      !this.props.seatInfo.seatDisabled ? this.props.seatInfo.playerId : undefined,
    );
  };

  // constructor(props: any) {
  //   super(props);

  //   this.doPlayersUpdate();
  // }

  private async doPlayersUpdate() {
    if (!this.props.seatInfo.seatDisabled && this.props.seatInfo.playerAvatarId) {
      const latestAvatar = await this.props.avatarService.getAvatarByIndex(this.props.seatInfo.playerAvatarId);
      if (this.characterAvatar.src !== latestAvatar.src) {
        mobx.runInAction(() => {
          this.characterAvatar = latestAvatar;
        });
      }
    } else {
      const latestAvatar = this.props.imageLoader.getEmptySeatImage();
      if (this.characterAvatar.src !== latestAvatar.src) {
        mobx.runInAction(() => {
          this.characterAvatar = latestAvatar;
        });
      }
    }
  }

  componentDidUpdate() {
    this.doPlayersUpdate();
  }

  render() {
    return (
      <span
        className={classNames(styles.seat, {
          [styles.clickable]: this.props.clickable,
        })}
        onClick={this.onClick}
      >
        {!this.props.seatInfo.seatDisabled && (
          <span className={styles.playerName}>{this.props.seatInfo.playerName}</span>
        )}
        <Picture
          image={this.characterAvatar}
          className={classNames(styles.seatImage, {
            [styles.seatClosed]: this.props.seatInfo.seatDisabled,
          })}
        />
        {!this.props.seatInfo.seatDisabled && this.props.seatInfo.playerReady && (
          <StatusBadge className={styles.userGetReady} text={this.props.translator.tr(Messages.ready())} />
        )}
      </span>
    );
  }
}

@mobxReact.observer
export class Seats extends React.Component<SeatsProps> {
  private isReady = false;

  onClickSeat = (closeSeat: boolean, seatId: number, kickedPlayerId?: PlayerId) => {
    if (this.props.store.selfPlayerId === kickedPlayerId || !this.props.isHost) {
      return;
    }

    this.props.senderService.kickPlayerOrCloseSeat(seatId, closeSeat, kickedPlayerId);
  };

  @mobx.computed
  get isEveryoneReady() {
    return this.props.store.seats.every(seat => (seat.seatDisabled || seat.playerId == null ? true : seat.playerReady));
  }

  @mobx.computed
  get countPlayers() {
    if (this.props.store.gameSettings.gameMode === GameMode.Pve) {
      return this.props.store.gameSettings.pveNumberOfPlayers;
    }

    return this.props.store.seats.filter(seat => !seat.seatDisabled && seat.playerId != null).length;
  }

  private readonly transferHost = (playerId: PlayerId) => () => {
    this.props.senderService.giveHostTo(this.props.store.selfPlayerId, playerId);
  };

  createSeats = () => {
    const seatComponents: JSX.Element[] = [];
    for (const seat of this.props.store.seats) {
      const hostControl = this.props.isHost && this.props.store.selfPlayerId !== (seat as any).playerId;
      seatComponents.push(
        <span className={styles.seatComponent} key={seat.seatId}>
          {hostControl && (seat as any).playerId && (
            <Button
              variant="primary"
              onClick={this.transferHost((seat as any).playerId)}
              className={styles.giveHostButton}
            >
              {this.props.translator.tr(Messages.transferHost())}
            </Button>
          )}
          <ClickableSeat
            imageLoader={this.props.imageLoader}
            seatInfo={seat}
            translator={this.props.translator}
            avatarService={this.props.avatarService}
            selfPlayerId={this.props.store.selfPlayerId}
            onClick={this.onClickSeat}
            clickable={hostControl}
          />
        </span>,
      );
    }

    return seatComponents;
  };

  private readonly getReady = () => {
    this.isReady = !this.isReady;
    this.props.senderService.getReady(this.props.store.selfPlayerId, this.isReady);
  };

  private readonly requestGameStart = () => {
    let gameMode = this.props.store.gameSettings.gameMode;
    if (
      this.props.store.gameSettings.gameMode === GameMode.Pve &&
      this.props.store.gameSettings.pveNumberOfPlayers === 5
    ) {
      gameMode = GameMode.PveClassic;
    }

    this.props.senderService.requestGameStart({
      ...this.props.store.gameSettings,
      numberOfPlayers: this.countPlayers,
      roomName: this.props.roomName,
      coreVersion: Sanguosha.Version,
      campaignMode: false,
      gameMode,
    });
  };

  renderPlayerControlButton() {
    if (this.props.isHost) {
      const selfSeat = this.props.store.seats.find(
        s => !s.seatDisabled && s.playerId === this.props.store.selfPlayerId,
      );
      if (selfSeat && !selfSeat.seatDisabled && !selfSeat.playerReady) {
        return (
          <Button className={styles.startButton} variant="primary" onClick={this.getReady}>
            {this.props.translator.tr(Messages.getReady())}
          </Button>
        );
      }

      return (
        <Button
          className={styles.startButton}
          variant="primary"
          onClick={this.requestGameStart}
          disabled={!this.isEveryoneReady || !this.props.validToStartGame}
        >
          {this.props.translator.tr(Messages.gameStart())}
        </Button>
      );
    } else {
      return (
        <Button className={styles.startButton} variant="primary" onClick={this.getReady}>
          {this.isReady
            ? this.props.translator.tr(Messages.cancelReady())
            : this.props.translator.tr(Messages.getReady())}
        </Button>
      );
    }
  }

  render() {
    return (
      <div className={classNames(styles.conainer, this.props.className)}>
        {this.createSeats()}
        {this.renderPlayerControlButton()}
      </div>
    );
  }
}
