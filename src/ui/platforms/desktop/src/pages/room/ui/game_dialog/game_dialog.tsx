import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import styles from './game_dialog.module.css';

export type GameDialogProps = {
  translator: ClientTranslationModule;
  store: RoomStore;
  presenter: RoomPresenter;
};

@mobxReact.observer
export class GameDialog extends React.Component<GameDialogProps> {
  private dialogElementRef = React.createRef<HTMLDivElement>();

  componentDidUpdate() {
    if (this.dialogElementRef.current) {
      this.dialogElementRef.current.scrollTop = this.dialogElementRef.current.scrollHeight;
    }
  }

  render() {
    return (
      <div className={styles.gameDialog} ref={this.dialogElementRef}>
        {this.props.store.gameLog.map((log, index) =>
          typeof log === 'string' ? (
            <p className={styles.messageLine} key={index} dangerouslySetInnerHTML={{ __html: log }} />
          ) : (
            <p className={styles.messageLine} key={index}>
              {log}
            </p>
          ),
        )}
      </div>
    );
  }
}
