import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { ClientSocket } from 'core/network/socket.client';
import {
  RoomSocketEvent,
  RoomSocketEventResponser,
} from 'core/shares/types/server_types';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { match } from 'react-router-dom';
import { PagePropsWithHostConfig } from 'types/page_props';
import { RoomPresenter, RoomStore } from './room.presenter';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithHostConfig<{
    match: match<{ slug: string }>;
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
    const playerName = 'test';
    const event: ClientEventFinder<GameEventIdentifiers.PlayerEnterEvent> = {
      playerName,
    };

    this.socket.notify(RoomSocketEvent.JoinRoom, {
      roomId: this.props.match.params.slug,
      playerName,
    });
    this.socket.notify(GameEventIdentifiers.PlayerEnterEvent, event);

    this.socket
      .on(
        RoomSocketEvent.JoinRoom,
        (event: RoomSocketEventResponser<RoomSocketEvent.JoinRoom>) => {
          this.presenter.setupRoomInfo(event);
        },
      )
      .on(
        RoomSocketEvent.GameStart,
        (event: RoomSocketEventResponser<RoomSocketEvent.GameStart>) => {
          this.presenter.createClientRoom(
            parseInt(this.props.match.params.slug, 10),
            this.socket,
            this.store.gameInfo,
            event.gameStartInfo,
          );
        },
      );
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

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
