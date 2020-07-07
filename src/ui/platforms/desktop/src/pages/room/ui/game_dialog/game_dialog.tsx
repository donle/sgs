import { GameEventIdentifiers } from 'core/event/event';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Input } from 'ui/input/input';
import styles from './game_dialog.module.css';

export type GameDialogProps = {
  translator: ClientTranslationModule;
  store: RoomStore;
  presenter: RoomPresenter;
};

@mobxReact.observer
export class GameDialog extends React.Component<GameDialogProps> {
  private dialogElementRef = React.createRef<HTMLDivElement>();

  @mobx.observable.ref
  private textMessage: string | undefined;

  componentDidUpdate() {
    if (this.dialogElementRef.current) {
      this.dialogElementRef.current.scrollTop = this.dialogElementRef.current.scrollHeight;
    }
  }

  @mobx.action
  private readonly onMessageChange = (value?: string) => {
    this.textMessage = value;
  };

  private readonly onClickSendButton = () => {
    this.props.store.room.broadcast(GameEventIdentifiers.UserMessageEvent, {
      message: this.textMessage!,
      playerId: this.props.presenter.ClientPlayer!.Id,
    });
    this.onMessageChange('');
  };

  render() {
    return (
      <div className={styles.gameDialog}>
        <div className={styles.gameLogDialog} ref={this.dialogElementRef}>
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
        <div className={styles.messageDialog}>
          {this.props.store.messageLog.map((log, index) =>
            typeof log === 'string' ? (
              <p className={styles.messageLine} key={index} dangerouslySetInnerHTML={{ __html: log }} />
            ) : (
              <p className={styles.messageLine} key={index}>
                {log}
              </p>
            ),
          )}
        </div>
        <form className={styles.inputLabel}>
          <Input
            className={styles.chatInput}
            onChange={this.onMessageChange}
            placeholder={this.props.translator.tr('please enter your text here')}
            value={this.textMessage}
          />
          <Button
            className={styles.sendButton}
            variant="primary"
            onClick={this.onClickSendButton}
            disabled={!this.textMessage}
          >
            {this.props.translator.tr('send')}
          </Button>
        </form>
      </div>
    );
  }
}
