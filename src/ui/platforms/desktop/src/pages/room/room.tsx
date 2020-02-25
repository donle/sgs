import {
  ClientEventFinder,
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
  constructor(props: any) {
    super(props);

    const roomId = parseInt(this.props.match.params.slug, 10);
    this.presenter = new RoomPresenter();
    this.store = this.presenter.createStore();
    this.socket = new ClientSocket(this.props.config, roomId);
  }

  componentDidMount() {
    const playerName = 'test' + Date.now();
    const event: ClientEventFinder<GameEventIdentifiers.PlayerEnterEvent> = {
      playerName,
    };

    this.socket.notify(GameEventIdentifiers.PlayerEnterEvent, event);

    this.socket
      .on(
        GameEventIdentifiers.PlayerEnterEvent,
        (event: ServerEventFinder<GameEventIdentifiers.PlayerEnterEvent>) => {
          if (event.joiningPlayerName === playerName) {
            this.presenter.createClientRoom(
              parseInt(this.props.match.params.slug, 10),
              this.socket,
              event.gameInfo,
              event.playersInfo,
            );
          } else {
            const playerInfo = event.playersInfo.find(
              playerInfo => playerInfo.Name === event.joiningPlayerName,
            );

            if (!playerInfo) {
              throw new Error(`Unknown player ${event.joiningPlayerName}`);
            }

            this.presenter.playerEnter(playerInfo);
          }
          this.showMessageFromEvent(event);
        },
      )
      .on(
        GameEventIdentifiers.GameReadyEvent,
        (event: ServerEventFinder<GameEventIdentifiers.GameReadyEvent>) => {
          this.showMessageFromEvent(event);
        },
      );
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
      messages.forEach(message => {
        this.presenter.addGameLog(message);
      });
    }
  }

  private showMessageFromEvent(event: ServerEventFinder<GameEventIdentifiers>) {
    const { messages = [], translationsMessage } = event;
    this.showMessage(messages, translationsMessage);
  }

  render() {
    const { match } = this.props;
    return (
      <div>
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
