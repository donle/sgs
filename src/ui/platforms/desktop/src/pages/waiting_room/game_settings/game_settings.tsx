import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { RoomAvatarService } from '../services/avatar_service';
import { WaitingRoomSender } from '../services/sender_service';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomStore } from '../waiting_room.store';
import styles from './game_settings.module.css';

export type GameSettingsProps = {
  controlable: boolean;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
  avatarService: RoomAvatarService;
  senderService: WaitingRoomSender;
};

export class GameSettings extends React.Component<GameSettingsProps> {
  render() {
    return <div className={styles.container}>

    </div>;
  }
}
