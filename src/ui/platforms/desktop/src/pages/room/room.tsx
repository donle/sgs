import {
  createGameEventIdentifiersStringList,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import SocketIOClient from 'socket.io-client';
import { PagePropsWithHostConfig } from 'types/page_props';

const attachSocketListeners = (socket: SocketIOClient.Socket) => {
  for (const identifier of createGameEventIdentifiersStringList()) {
    socket.on(
      identifier.toString(),
      (event: ServerEventFinder<GameEventIdentifiers>) => {
        const type = parseInt(identifier, 10) as GameEventIdentifiers;
        onReceiveEvent(type, event);
      },
    );
  }
};

const onReceiveEvent = async <T extends GameEventIdentifiers>(
  identifier: T,
  event: ServerEventFinder<T>,
) => {};

export const RoomPage = mobxReact.observer((props: PagePropsWithHostConfig) => {
  const { config } = props;
  const { slug } = useParams<{ slug: string }>();
  const socket = SocketIOClient(
    `${config.protocal}://${config.host}:${config.port}`,
    {
      path: `/room-${slug}`,
    },
  );
  attachSocketListeners(socket);

  React.useEffect(() => {
    return () => {
      socket.disconnect();
      socket.close();
    };
  });

  return <div>{slug}</div>;
});
