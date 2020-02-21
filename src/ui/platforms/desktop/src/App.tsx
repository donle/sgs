import { Sanguosha } from 'core/game/engine';
import { DevMode, hostConfig } from 'core/shares/types/host_config';
import {
  Languages,
  Translation,
} from 'core/translations/translation_json_tool';
import { createBrowserHistory } from 'history';
import { RoomPage } from 'pages/room/room';
import * as React from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import SocketIOClient from 'socket.io-client';
import { UIConfigTypes } from 'ui.config';
import { SimplifiedChinese } from './languages';
import { Lobby } from './pages/lobby/lobby';

const mode = (process.env.DEV_MODE as DevMode) || DevMode.Dev;

export const App = (props: { config: UIConfigTypes }) => {
  Sanguosha.initialize();
  const socketConfig = hostConfig[mode];
  const socket = SocketIOClient(
    `${socketConfig.protocol}://${socketConfig.host}:${socketConfig.port}`,
    {
      path: '/lobby',
    },
  );

  const history = createBrowserHistory();
  const translator = Translation.setup(props.config.language, [
    Languages.ZH_CN,
    SimplifiedChinese,
  ]);

  React.useEffect(() => {
    document.title = translator.tr('New QSanguosha');
  });

  return (
    <Router history={history}>
      <div>
        <Switch>
          <Route path="/" exact>
            <Redirect to={'lobby'} />
          </Route>
          <Route path={'/lobby'}>
            <Lobby
              config={socketConfig}
              socket={socket}
              translator={translator}
            />
          </Route>
          <Route path={'/room/:slug'}>
            <RoomPage config={socketConfig} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};
