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
  replayMode?: boolean;
};

@mobxReact.observer
export class GameDialog extends React.Component<GameDialogProps> {
  private dialogElementRef = React.createRef<HTMLDivElement>();
  private userMessageDialogElementRef = React.createRef<HTMLDivElement>();
  private borderElementRef = React.createRef<HTMLDivElement>();

  private readonly textMessageMinHeight = 160;
  private readonly textMessageMaxHeight = 360;
  private textMessageStartTopPosition: number | undefined;
  private textMessageTopOffset: number = 0;

  @mobx.observable.ref
  private textMessage: string | undefined;
  @mobx.observable.ref
  private userMessageDialogStyles: React.CSSProperties = {
    minHeight: this.textMessageMinHeight,
    maxHeight: this.textMessageMinHeight,
  };
  @mobx.observable.ref
  private borderStyles: React.CSSProperties = { bottom: this.textMessageMinHeight };

  componentDidUpdate() {
    if (this.dialogElementRef.current) {
      this.dialogElementRef.current.scrollTop = this.dialogElementRef.current.scrollHeight;
    }
    if (this.userMessageDialogElementRef.current) {
      this.userMessageDialogElementRef.current.scrollTop = this.userMessageDialogElementRef.current.scrollHeight;
    }
  }

  @mobx.action
  private readonly onMessageChange = (value?: string) => {
    this.textMessage = value;
  };

  private readonly onClickSendButton = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    !this.props.replayMode &&
      this.props.store.room.broadcast(GameEventIdentifiers.UserMessageEvent, {
        message: this.textMessage!,
        playerId: this.props.presenter.ClientPlayer!.Id,
      });
    this.onMessageChange('');
  };

  private readonly onBorderDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.textMessageStartTopPosition = event.clientY;
    this.textMessageTopOffset = this.borderStyles.bottom as number;
    window.addEventListener('mousemove', this.onBorderMove);
  };
  @mobx.action
  private readonly onBorderMove = (e: MouseEvent) => {
    if (this.textMessageStartTopPosition === undefined) {
      return;
    }

    let height = this.textMessageStartTopPosition - e.clientY + this.textMessageTopOffset;
    height = Math.max(this.textMessageMinHeight, Math.min(this.textMessageMaxHeight, height));
    this.userMessageDialogStyles = {
      minHeight: height,
      maxHeight: height,
    };
    this.borderStyles = {
      bottom: height,
    };
  };

  private readonly onBorderLeave = () => {
    this.textMessageStartTopPosition = undefined;
    window.removeEventListener('mousemove', this.onBorderMove);
  };

  render() {
    return (
      <div className={styles.gameDialog}>
        <div className={styles.dialogs}>
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
          <div
            ref={this.borderElementRef}
            className={styles.dragBorder}
            style={this.borderStyles}
            onMouseDown={this.onBorderDown}
            onMouseUp={this.onBorderLeave}
          />
          <div
            className={styles.messageDialog}
            style={this.userMessageDialogStyles}
            ref={this.userMessageDialogElementRef}
          >
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
        </div>
        <form className={styles.inputLabel} onSubmit={this.onClickSendButton}>
          <Input
            className={styles.chatInput}
            onChange={this.onMessageChange}
            placeholder={this.props.translator.tr('please enter your text here')}
            value={this.textMessage}
          />
          <Button className={styles.sendButton} variant="primary" disabled={!this.textMessage}>
            {this.props.translator.tr('send')}
          </Button>
        </form>
      </div>
    );
  }
}
