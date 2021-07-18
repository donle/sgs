import { getAudioLoader } from 'audio_loader/audio_loader_util';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { createMemoryHistory } from 'history';
import { getImageLoader } from 'image_loader/image_loader_util';
import * as mobxReact from 'mobx-react';
import { CharactersList } from 'pages/characters_list/characters_list';
import { OpenningPage } from 'pages/openning/openning';
import { ReplayRoomPage } from 'pages/room/replay_room';
import { RoomPage } from 'pages/room/room';
import { ClientConfig } from 'props/config_props';
import * as React from 'react';
import { Redirect, Route, Router } from 'react-router-dom';
import { ConnectionService } from 'services/connection_service/connection_service';
import { Lobby } from './pages/lobby/lobby';
import { CharacterSkinInfo } from 'skins/skins';
@mobxReact.observer
export class App extends React.PureComponent<{
  config: ClientConfig;
  electronLoader: ElectronLoader;
  translator: ClientTranslationModule;
}> {
  private customHistory = createMemoryHistory();
  private skinData: CharacterSkinInfo[];
  private imageLoader = getImageLoader(this.props.config.flavor);
  private audioLoader = getAudioLoader(this.props.config.flavor);
  private connectionService = new ConnectionService(this.props.config);

  async getSkinData() {
    const url = process.env.PUBLIC_URL + '/skin_infos.json';
    await fetch(url)
      .then(res => res.json())
      .catch(error => console.error(error))
      .then(response => (this.skinData = response));
  }
  componentDidMount() {
    this.getSkinData();
    document.title = this.props.translator.tr('New QSanguosha');
  }

  render() {
    return (
      <Router history={this.customHistory}>
        <div>
          <Route path={'/'} exact>
            <Redirect to={'openning'} />
          </Route>
          <Route
            path={'/openning'}
            render={({ match, location, history }) => (
              <OpenningPage config={this.props.config} match={match} location={location} history={history} />
            )}
          />
          {this.props.electronLoader ? (
            <Route
              path={'/lobby'}
              render={({ match, location, history }) => (
                <Lobby
                  config={this.props.config}
                  match={match}
                  translator={this.props.translator}
                  location={location}
                  history={history}
                  imageLoader={this.imageLoader}
                  audioLoader={this.audioLoader}
                  electronLoader={this.props.electronLoader}
                  connectionService={this.connectionService}
                />
              )}
            />
          ) : (
            <Route
              path={'/openning'}
              render={({ match, location, history }) => (
                <OpenningPage config={this.props.config} match={match} location={location} history={history} />
              )}
            />
          )}
          <Route
            path={'/replay'}
            render={({ match, location, history }) => (
              <ReplayRoomPage
                location={location}
                history={history}
                match={match}
                skinData={this.skinData}
                imageLoader={this.imageLoader}
                audioLoader={this.audioLoader}
                electronLoader={this.props.electronLoader}
                config={this.props.config}
                translator={this.props.translator}
                connectionService={this.connectionService}
              />
            )}
          />
          <Route
            path={'/characters'}
            render={({ match, location, history }) => (
              <CharactersList
                location={location}
                history={history}
                match={match}
                skinData={this.skinData}
                imageLoader={this.imageLoader}
                audioLoader={this.audioLoader}
                electronLoader={this.props.electronLoader}
                config={this.props.config}
                translator={this.props.translator}
              />
            )}
          />
          <Route
            path={'/room/:slug'}
            render={({ match, location, history }) => (
              <RoomPage
                location={location}
                history={history}
                match={match}
                skinData={this.skinData}
                imageLoader={this.imageLoader}
                audioLoader={this.audioLoader}
                electronLoader={this.props.electronLoader}
                config={this.props.config}
                translator={this.props.translator}
                connectionService={this.connectionService}
              />
            )}
          />
        </div>
      </Router>
    );
  }
}
