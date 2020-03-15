import { clientActiveListenerEvents, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { ClientSocket } from 'core/network/socket.client';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router-dom';
import { PagePropsWithHostConfig } from 'types/page_props';
import { Dashboard } from './dashboard/dashboard';
import { GameDialog } from './game_dialog/game_dialog';
import { GameClientProcessor } from './game_processor';
import styles from './room.module.css';
import { RoomPresenter, RoomStore } from './room.presenter';
import { SeatsLayout } from './seats_layout/seats_layout';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithHostConfig<{
    match: match<{ slug: string }>;
    translator: ClientTranslationModule;
  }>
> {
  private presenter: RoomPresenter;
  private store: RoomStore;
  private socket: ClientSocket;
  private gameProcessor: GameClientProcessor;
  private roomId: number;

  constructor(props: any) {
    super(props);

    this.roomId = parseInt(this.props.match.params.slug, 10);
    this.presenter = new RoomPresenter();
    this.store = this.presenter.createStore();
    this.socket = new ClientSocket(this.props.config, this.roomId);

    this.gameProcessor = new GameClientProcessor(this.presenter, this.store, this.props.translator);
  }

  componentDidMount() {
    const playerName = 'test' + Date.now();

    this.presenter.setupRoomStatus({
      playerName,
      socket: this.socket,
      roomId: this.roomId,
      timestamp: Date.now(),
    });

    this.socket.notify(GameEventIdentifiers.PlayerEnterEvent, {
      playerName,
      timestamp: this.store.clientRoomInfo.timestamp,
    });

    this.socket.on(GameEventIdentifiers.PlayerEnterRefusedEvent, () => {
      this.props.history.push('/lobby');
    });

    clientActiveListenerEvents().forEach(identifier => {
      this.socket.on(identifier, (content: ServerEventFinder<GameEventIdentifiers>) => {
        this.gameProcessor.onHandleIncomingEvent(identifier, content);
        this.showMessageFromEvent(content);
      });
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  private showMessage(messages: string[] = [], translationsMessage?: PatchedTranslationObject) {
    const { translator } = this.props;

    if (translationsMessage) {
      messages.push(TranslationPack.create(translationsMessage).toString());
    }
    messages.forEach(message => {
      this.presenter.addGameLog(translator.trx(message));
    });
  }

  private showMessageFromEvent(event: ServerEventFinder<GameEventIdentifiers>) {
    const { messages, translationsMessage } = event;
    this.showMessage(messages, translationsMessage);
  }

  private getDummyCentralInfo() {
    return (
      <>
        room Id: {this.props.match.params.slug}
        {this.store.room && (
          <>
            <div>
              room Info:
              {JSON.stringify(this.store.room.getRoomInfo(), null, 2)}
            </div>
            <div>game Info: {JSON.stringify(this.store.room.Info, null, 2)}</div>
          </>
        )}
      </>
    );
  }

  render() {
    return (
      <div className={styles.room}>
        {this.store.selectorDialog}

        <div className={styles.incomingConversation}>{this.store.incomingConversation}</div>
        {this.store.room && (
          <div className={styles.roomBoard}>
            <div className={styles.mainBoard}>
              <SeatsLayout
                updateFlag={this.store.updateUIFlag}
                store={this.store}
                presenter={this.presenter}
                translator={this.props.translator}
                onClick={this.store.onClickPlayer}
                playerSelectableMatcher={this.store.playersSelectionMatcher}
                gamePad={this.getDummyCentralInfo()}
              />
              <div className={styles.sideBoard}>
                <GameDialog store={this.store} presenter={this.presenter} translator={this.props.translator} />
              </div>
            </div>
            <Dashboard
              updateFlag={this.store.updateUIFlag}
              store={this.store}
              presenter={this.presenter}
              translator={this.props.translator}
              cardEnableMatcher={this.store.clientPlayerCardActionsMatcher}
              onClickConfirmButton={this.store.confirmButtonAction}
              onClickCancelButton={this.store.cancelButtonAction}
              onClickFinishButton={this.store.finishButtonAction}
              onClick={this.store.onClickHandCardToPlay}
            />
          </div>
        )}
      </div>
    );
  }
}
