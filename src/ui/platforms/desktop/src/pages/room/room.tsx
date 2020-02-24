import {
  ClientEventFinder,
  createGameEventIdentifiersStringList,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import {
  RoomSocketEvent,
  RoomSocketEventResponser,
} from 'core/shares/types/server_types';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router-dom';
import SocketIOClient from 'socket.io-client';
import { PagePropsWithHostConfig } from 'types/page_props';
import { RoomPresenter, RoomStore } from './room.presenter';
import { RoomEventProcessor } from './room_event_processor';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithHostConfig<{
    match: match<{ slug: string }>;
  }>
> {
  private presenter: RoomPresenter;
  private store: RoomStore;
  private socket: SocketIOClient.Socket;
  constructor(props: any) {
    super(props);

    const { config, match } = this.props;
    this.presenter = new RoomPresenter();
    this.store = this.presenter.createStore();
    this.socket = SocketIOClient(
      `${config.protocol}://${config.host}:${config.port}/room-${match.params.slug}`,
    );
  }

  componentDidMount() {
    this.attachSocketListeners(this.socket, this.presenter);
    const event: ClientEventFinder<GameEventIdentifiers.PlayerEnterEvent> = {
      playerName: 'test',
    };

    this.socket.emit(RoomSocketEvent.JoinRoom, {
      roomId: this.props.match.params.slug,
    });
    this.socket.emit(GameEventIdentifiers.PlayerEnterEvent.toString(), event);

    this.socket.on(
      RoomSocketEvent.JoinRoom,
      (event: RoomSocketEventResponser<RoomSocketEvent.JoinRoom>) => {
        this.presenter.setupRoomInfo(event.roomInfo);
      },
    );
  }

  componentWillUnmount() {
    this.socket.disconnect();
    this.socket.close();
  }

  private readonly attachSocketListeners = (
    socket: SocketIOClient.Socket,
    presenter: RoomPresenter,
  ) => {
    for (const identifier of createGameEventIdentifiersStringList()) {
      socket.on(
        identifier.toString(),
        (event: ServerEventFinder<GameEventIdentifiers>) => {
          const type = parseInt(identifier, 10) as GameEventIdentifiers;

          RoomEventProcessor.Instance.onHandleIncomingEvent(
            type,
            event,
            presenter,
          );
        },
      );
    }
  };

  render() {
    const { match } = this.props;
    return (
      <div>
        room Id: {match.params.slug}
        <div>room Info: {JSON.stringify(this.store.roomInfo, null, 2)}</div>
      </div>
    );
  }
}
