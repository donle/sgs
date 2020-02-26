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
import { UIConfigTypes } from 'ui.config';
import { SimplifiedChinese } from './languages';
import { Lobby } from './pages/lobby/lobby';

const mode = (process.env.DEV_MODE as DevMode) || DevMode.Dev;

export const App = (props: { config: UIConfigTypes }) => {
  Sanguosha.initialize();
  const socketConfig = hostConfig[mode];
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
          <Route
            path={'/lobby'}
            render={({ match, location, history }) => (
              <Lobby
                config={socketConfig}
                match={match}
                translator={translator}
                location={location}
                history={history}
              />
            )}
          ></Route>
          <Route
            path={'/room/:slug'}
            render={({ match, location, history }) => (
              <RoomPage
                location={location}
                history={history}
                match={match}
                config={socketConfig}
                translator={translator}
              />
            )}
          />
        </Switch>
      </div>
    </Router>
  );
};
