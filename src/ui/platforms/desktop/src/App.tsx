import { DevMode, hostConfig } from 'core/game/host.config';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import SocketIOClient from 'socket.io-client';
import styles from './App.module.css';
import { Lobby } from './pages/lobby/lobby';

const mode = process.env.DEV_MODE as DevMode || DevMode.Dev;

export const App: React.FC = () => {
  const config = hostConfig[mode];
  const socket = SocketIOClient(
    `${config.protocal}://${config.host}:${config.port}`,
    {
      path: '/lobby',
    },
  );
  return (
    <div className={styles.container}>
      <Switch>
        <Route path={'/lobby'}>
          <Lobby config={config} socket={socket} />
        </Route>
      </Switch>
    </div>
  );
};
