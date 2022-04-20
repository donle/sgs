import classNames from 'classnames';
import { WaitingRoomEvent } from 'core/event/event';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import { ImageProps } from 'props/image_props';
import * as React from 'react';
import { Picture } from 'ui/picture/picture';
import { RoomAvatarService } from '../services/avatar_service';
import { WaitingRoomSender } from '../services/sender_service';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomSeatInfo, WaitingRoomStore } from '../waiting_room.store';
import styles from './seats.module.css';

export type SeatsProps = {
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
  avatarService: RoomAvatarService;
  senderService: WaitingRoomSender;
};

const ClickableSeat = React.memo(
  (props: {
    imageLoader: ImageLoader;
    seatInfo: WaitingRoomSeatInfo;
    avatarService: RoomAvatarService;
    onClick(closeSeat: boolean, seatId: number): void;
  }) => {
    const emptySeatImage = props.imageLoader.getEmptySeatImage();
    const [characterAvatar, setCharacterAvatar] = React.useState<ImageProps>(emptySeatImage);
    React.useEffect(() => {
      if (!props.seatInfo.seatDisabled) {
        const getAvatar = async () =>
          props.seatInfo.seatDisabled || !props.seatInfo.playerAvatarId
            ? emptySeatImage
            : await props.avatarService.getAvatarByIndex(props.seatInfo.playerAvatarId);

        getAvatar().then(character => {
          setCharacterAvatar(character);
        });
      }
    }, [characterAvatar]);

    const onClick = () => {
      props.onClick(!props.seatInfo.seatDisabled, props.seatInfo.seatId);
    };

    return (
      <span className={styles.seat} onClick={onClick}>
        {!props.seatInfo.seatDisabled && <span className={styles.playerName}>{props.seatInfo.playerName}</span>}
        <Picture
          image={characterAvatar}
          className={classNames(styles.seatImage, {
            [styles.seatClosed]: props.seatInfo.seatDisabled,
          })}
        />
      </span>
    );
  },
);

export class Seats extends React.Component<SeatsProps> {
  onClickSeat = (closeSeat: boolean, seatId: number) => {
    this.props.senderService.kickPlayerOrCloseSeat(seatId, closeSeat);
  };

  createSeats = () => {
    const seatComponents: JSX.Element[] = [];
    for (const seat of this.props.store.seats) {
      seatComponents.push(
        <span className={styles.seatComponent} key={seat.seatId}>
          <ClickableSeat
            imageLoader={this.props.imageLoader}
            seatInfo={seat}
            avatarService={this.props.avatarService}
            onClick={this.onClickSeat}
          />
        </span>,
      );
    }
  };

  render() {
    return <div className={styles.conainer}></div>;
  }
}
