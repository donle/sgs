import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter } from 'pages/room/room.presenter';
import { RoomStore } from 'pages/room/room.store';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { MessageDialog } from '../message_dialog/message_dialog';
import styles from './game_dialog.module.css';

export type GameDialogProps = {
  translator: ClientTranslationModule;
  store: RoomStore;
  presenter: RoomPresenter;
  connectionService: ConnectionService;
  replayOrObserverMode?: boolean;
};

@mobxReact.observer
export class GameDialog extends React.Component<GameDialogProps> {
  private dialogElementRef = React.createRef<HTMLDivElement>();
  private borderElementRef = React.createRef<HTMLDivElement>();
  @mobx.observable.ref
  private dialogHeight: React.CSSProperties;
  private mouseDown = false;
  @mobx.observable.ref
  private fixedHeight = 0;
  private textMessageStartTopPosition: number | undefined;

  componentDidMount() {
    window.addEventListener('mousedown', e => {
      if (e.currentTarget === this.borderElementRef.current) {
        this.mouseDown = true;
      }
    });
    window.addEventListener('mouseup', e => {
      this.mouseDown = false;
      window.removeEventListener('mousemove', this.onBorderMove);
    });
  }

  componentDidUpdate() {
    if (this.dialogElementRef.current) {
      this.dialogElementRef.current.scrollTop = this.dialogElementRef.current.scrollHeight;
    }
  }

  private readonly onBorderDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.textMessageStartTopPosition = event.clientY;
    window.addEventListener('mousemove', this.onBorderMove);
  };
  @mobx.action
  private readonly onBorderMove = (e: MouseEvent) => {
    if (this.textMessageStartTopPosition === undefined) {
      return;
    }
    if (this.fixedHeight === this.textMessageStartTopPosition - e.clientY) {
      return;
    }

    this.fixedHeight = this.textMessageStartTopPosition - e.clientY;
    this.textMessageStartTopPosition = e.clientY;
    const height = this.dialogElementRef.current!.clientHeight - this.fixedHeight;
    this.dialogHeight = {
      height,
    };
  };

  private readonly onBorderLeave = () => {
    this.textMessageStartTopPosition = undefined;
    if (!this.mouseDown) {
      window.removeEventListener('mousemove', this.onBorderMove);
    }
  };

  render() {
    return (
      <div className={styles.gameDialog}>
        <div className={styles.dialogs}>
          <div className={styles.gameLogDialog} ref={this.dialogElementRef} style={this.dialogHeight}>
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
            onMouseDown={this.onBorderDown}
            onMouseUp={this.onBorderLeave}
          />
          <MessageDialog
            translator={this.props.translator}
            store={this.props.store}
            presenter={this.props.presenter}
            replayMode={this.props.replayOrObserverMode}
            fixedHeight={this.fixedHeight}
            connectionService={this.props.connectionService}
          />
        </div>
      </div>
    );
  }
}
