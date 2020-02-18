import { Sanguosha } from 'core/game/engine';
import { DevMode, hostConfig } from 'core/shares/types/host_config';
import {
  Languages,
  Translation,
} from 'core/translations/translation_json_tool';
import { createBrowserHistory } from 'history';
import { SimplifiedChinese } from 'languages';
import { RoomPage } from 'pages/room/room';
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
  const history = createBrowserHistory();
  const translator = Translation.setup(Languages.EN_AU, [
    Languages.ZH_CN,
    SimplifiedChinese,
  ]);

  return (
    <Router history={history}>
      <div>
        <Switch>
          <Route path="/" exact>
            <Redirect to={'lobby'} />
          </Route>
          <Route path={'/lobby'}>
            <Lobby config={config} socket={socket} translator={translator} />
          </Route>
          <Route path={'/room/:slug'} component={RoomPage}></Route>
        </Switch>
      </div>
    </Router>
  );
};
