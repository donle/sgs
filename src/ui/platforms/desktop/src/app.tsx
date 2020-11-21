import { getAudioLoader } from 'audio_loader/audio_loader_util';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { createHashHistory } from 'history';
import { getImageLoader } from 'image_loader/image_loader_util';
import { RoomPage } from 'pages/room/room';
import { ClientConfig } from 'props/config_props';
import * as React from 'react';
import { Redirect, Route, Router } from 'react-router-dom';
import { Lobby } from './pages/lobby/lobby';

export const App = (props: { config: ClientConfig; translator: ClientTranslationModule }) => {
  const customHistory = createHashHistory();

  React.useEffect(() => {
    document.title = props.translator.tr('New QSanguosha');
  });
  const imageLoader = getImageLoader(props.config.flavor);
  const audioLoader = getAudioLoader(props.config.flavor);

  return (
    <Router history={customHistory}>
      <div>
        <Route path={'/'} exact>
          <Redirect to={'lobby'} />
        </Route>
        <Route
          path={'/lobby'}
          render={({ match, location, history }) => (
            <Lobby
              config={props.config}
              match={match}
              translator={props.translator}
              location={location}
              history={history}
              imageLoader={imageLoader}
              audioLoader={audioLoader}
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
              imageLoader={imageLoader}
              audioLoader={audioLoader}
              config={props.config}
              translator={props.translator}
            />
          )}
        />
      </div>
    </Router>
  );
};
