import { Sanguosha } from 'core/game/engine';
import { DevMode, hostConfig } from 'core/shares/types/host_config';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import SocketIOClient from 'socket.io-client';
import { Lobby } from './pages/lobby/lobby';

const mode = (process.env.DEV_MODE as DevMode) || DevMode.Dev;

export const App: React.FC = () => {
  Sanguosha.initialize();
  const config = hostConfig[mode];
  const socket = SocketIOClient(
    `${config.protocal}://${config.host}:${config.port}`,
    {
      path: '/lobby',
    },
  );
  return (
    <Router history={createBrowserHistory()}>
      <div>
        <Switch>
          <Route path="/" exact>
            <Redirect to={'lobby'} />
          </Route>
          <Route path={'/lobby'}>
            <Lobby config={config} socket={socket} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};
