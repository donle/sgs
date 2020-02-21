import {
  ClientEventFinder,
  createGameEventIdentifiersStringList,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import SocketIOClient from 'socket.io-client';
import { PagePropsWithHostConfig } from 'types/page_props';
import { RoomPresenter } from './room.presenter';
import { RoomEventProcessor } from './room_event_processor';

const attachSocketListeners = (
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

export const RoomPage = mobxReact.observer((props: PagePropsWithHostConfig) => {
  const roomPresenter = new RoomPresenter();
  const roomStore = roomPresenter.createStore();

  const { config } = props;
  const { slug } = useParams<{ slug: string }>();
  const socket = SocketIOClient(
    `${config.protocol}://${config.host}:${config.port}`,
    {
      path: `/room-${slug}`,
    },
  );

  attachSocketListeners(socket, roomPresenter);
  const event: ClientEventFinder<GameEventIdentifiers.PlayerEnterEvent> = {
    playerName: 'test',
  };

  socket.emit(GameEventIdentifiers.PlayerEnterEvent.toString(), event);

  React.useEffect(() => {
    return () => {
      socket.disconnect();
      socket.close();
    };
  });

  return (
    <div>
      {slug} {roomStore.roomInfo}
    </div>
  );
});
