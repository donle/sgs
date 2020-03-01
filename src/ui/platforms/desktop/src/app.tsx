import { ClientConfigTypes } from 'client.config';
import { Translation } from 'core/translations/translation_json_tool';
import { createBrowserHistory } from 'history';
import { RoomPage } from 'pages/room/room';
import * as React from 'react';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { Lobby } from './pages/lobby/lobby';

export const App = (props: {
  config: ClientConfigTypes;
  translator: Translation;
}) => {
  const customHistory = createBrowserHistory();

  React.useEffect(() => {
    document.title = props.translator.tr('New QSanguosha');
  });

  return (
    <Router history={customHistory}>
      <div>
        <Switch>
          <Route path="/" exact>
            <Redirect to={'lobby'} />
          </Route>
          <Route
            path={'/lobby'}
            render={({ match, location, history }) => (
              <Lobby
                config={props.config.host}
                match={match}
                translator={props.translator}
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
                config={props.config.host}
                translator={props.translator}
              />
            )}
          />
        </Switch>
      </div>
    </Router>
  );
};
