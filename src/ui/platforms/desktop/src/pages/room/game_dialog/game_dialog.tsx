import { Translation } from 'core/translations/translation_json_tool';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { RoomPresenter, RoomStore } from '../room.presenter';
import styles from './game_dialog.module.css';

export type GameDialogProps = {
  translator: Translation;
  store: RoomStore;
  presenter: RoomPresenter;
};

@mobxReact.observer
export class GameDialog extends React.Component<GameDialogProps> {
  render() {
    return (
      <div className={styles.gameDialog}>
        {this.props.store.gameLog.map(log => (
          <p>{log}</p>
        ))}
      </div>
    );
  }
}
