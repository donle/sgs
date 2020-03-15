import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { RoomPresenter, RoomStore } from '../room.presenter';
import styles from './game_dialog.module.css';

export type GameDialogProps = {
  translator: ClientTranslationModule;
  store: RoomStore;
  presenter: RoomPresenter;
};

@mobxReact.observer
export class GameDialog extends React.Component<GameDialogProps> {
  render() {
    return (
      <div className={styles.gameDialog}>
        {this.props.store.gameLog.map((log, index) => (
          <p className={styles.messageLine} key={index}>
            {log}
          </p>
        ))}
      </div>
    );
  }
}
