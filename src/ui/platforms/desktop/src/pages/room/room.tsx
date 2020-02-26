import {
  clientActiveListenerEvents,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { ClientSocket } from 'core/network/socket.client';
import {
  PatchedTranslationObject,
  Translation,
} from 'core/translations/translation_json_tool';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router-dom';
import { PagePropsWithHostConfig } from 'types/page_props';
import { GameClientProcessor } from './game_processor';
import { RoomPresenter, RoomStore } from './room.presenter';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithHostConfig<{
    match: match<{ slug: string }>;
    translator: Translation;
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

    this.gameProcessor = new GameClientProcessor(
      this.presenter,
      this.store,
      this.props.translator,
    );
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
      this.socket.on(
        identifier,
        (content: ServerEventFinder<GameEventIdentifiers>) => {
          this.gameProcessor.onHandleIncomingEvent(identifier, content);
          this.showMessageFromEvent(content);
        },
      );
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  private showMessage(
    messages: string[] = [],
    translationsMessage?: PatchedTranslationObject,
  ) {
    if (translationsMessage) {
      messages.push(this.props.translator.tr(translationsMessage));
    }
    messages.forEach(message => {
      this.presenter.addGameLog(this.props.translator.tr(message));
    });
  }

  private showMessageFromEvent(event: ServerEventFinder<GameEventIdentifiers>) {
    const { messages, translationsMessage } = event;
    this.showMessage(messages, translationsMessage);
  }

  render() {
    const { match } = this.props;
    return (
      <div>
        {this.store.gameDialog}
        room Id: {match.params.slug}
        {this.store.room && (
          <>
            <div>
              room Info:
              {JSON.stringify(this.store.room.getRoomInfo(), null, 2)}
            </div>
            <div>
              game Info: {JSON.stringify(this.store.room.Info, null, 2)}
            </div>
          </>
        )}
        {this.store.gameLog.map(log => (
          <p>{log}</p>
        ))}
      </div>
    );
  }
}
