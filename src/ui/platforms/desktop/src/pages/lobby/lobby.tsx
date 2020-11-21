import logoImage from 'assets/images/lobby/logo.png';
import { AudioLoader } from 'audio_loader/audio_loader';
import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions, GameCharacterExtensions } from 'core/game/game_props';
import { LobbySocketEvent, LobbySocketEventPicker, RoomInfo } from 'core/shares/types/server_types';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { SettingsDialog } from 'pages/ui/settings/settings';
import { LobbyButton } from 'props/game_props';
import * as React from 'react';
import SocketIOClient from 'socket.io-client';
import { PagePropsWithConfig } from 'types/page_props';
import { installAudioPlayerService } from 'ui/audio/install';
import { Button } from 'ui/button/button';
import { LinkButton } from 'ui/button/link_button';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './lobby.module.css';
import { AcknowledgeDialog } from './ui/acknowledge_dialog/acknowledge_dialog';
import { CreateRoomButton } from './ui/create_room_button/create_room_button';
import { CreatRoomDialog, TemporaryRoomCreationInfo } from './ui/create_room_dialog/create_room_dialog';

type LobbyProps = PagePropsWithConfig<{
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
}>;

@mobxReact.observer
export class Lobby extends React.Component<LobbyProps> {
  @mobx.observable.shallow
  private roomList: RoomInfo[] = [];
  @mobx.observable.ref
  private unmatchedCoreVersion = false;
  @mobx.observable.ref
  private openRoomCreationDialog = false;
  @mobx.observable.ref
  private openSettings = false;
  @mobx.observable.ref
  private defaultMainVolume = window.localStorage.getItem('mainVolume')
    ? Number.parseInt(window.localStorage.getItem('mainVolume')!, 10)
    : 50;
  @mobx.observable.ref
  private defaultGameVolume = window.localStorage.getItem('gameVolume')
    ? Number.parseInt(window.localStorage.getItem('gameVolume')!, 10)
    : 50;
  @mobx.observable.ref
  private openAcknowledgement = false;

  private socket = SocketIOClient(
    `${this.props.config.host.protocol}://${this.props.config.host.host}:${this.props.config.host.port}/lobby`,
  );

  private backgroundImage = this.props.imageLoader.getLobbyBackgroundImage().src!;
  private illustrationImage = this.props.imageLoader.getRandomLobbyIllustration().src!;
  private roomListBackgroundImage = this.props.imageLoader.getRoomListBackgroundImage().src!;
  private createRoomImage = this.props.imageLoader.getCreateRoomButtonImage().src!;
  private audioService = installAudioPlayerService(this.props.audioLoader);

  constructor(props: LobbyProps) {
    super(props);

    this.socket
      .on(
        LobbySocketEvent.VersionMismatch.toString(),
        mobx.action((matched: LobbySocketEventPicker<LobbySocketEvent.VersionMismatch>) => {
          this.unmatchedCoreVersion = !matched;
        }),
      )
      .on(
        LobbySocketEvent.QueryRoomList.toString(),
        mobx.action((content: LobbySocketEventPicker<LobbySocketEvent.QueryRoomList>) => {
          this.roomList = content;
        }),
      )
      .on(
        LobbySocketEvent.GameCreated.toString(),
        mobx.action((event: LobbySocketEventPicker<LobbySocketEvent.GameCreated>) => {
          const { roomId, roomInfo } = event;
          this.props.history.push(`/room/${roomId}`, { gameMode: roomInfo.gameMode });
        }),
      );
  }

  private readonly settings = {
    onVolumeChange: mobx.action((volume: number) => {
      window.localStorage.setItem('gameVolume', volume.toString());
      this.defaultGameVolume = volume;
      this.audioService.changeGameVolume();
    }),
    onMainVolumeChange: mobx.action((volume: number) => {
      window.localStorage.setItem('mainVolume', volume.toString());
      this.defaultMainVolume = volume;
      this.audioService.changeBGMVolume();
    }),
  };

  componentDidMount() {
    this.audioService.playLobbyBGM();
  }

  componentWillUnmount() {
    this.audioService.stop();
  }

  @mobx.action
  UNSAFE_componentWillMount() {
    this.socket.emit(LobbySocketEvent.QueryRoomList.toString());
    this.socket.emit(LobbySocketEvent.QueryVersion.toString(), {
      version: Sanguosha.Version,
    });

    if (window.innerWidth < 1200) {
      window.screen.orientation.lock('landscape');
    }
  }

  @mobx.action
  private readonly onCreateRoom = () => {
    if (this.unmatchedCoreVersion) {
      return;
    }

    this.openRoomCreationDialog = true;
  };

  private readonly onClickRefresh = () => {
    if (this.unmatchedCoreVersion) {
      return;
    }

    this.socket.emit(LobbySocketEvent.QueryRoomList.toString());
  };

  unmatchedView() {
    //TODO: complete unmatched view;
    return <div>{this.props.translator.tr('Unmatched core version, please update your application')}</div>;
  }

  private readonly enterRoom = (roomInfo: RoomInfo) => () => {
    this.props.history.push(`/room/${roomInfo.id}`);
  };

  @mobx.action
  private readonly onRoomCreated = (roomInfo: TemporaryRoomCreationInfo) => {
    this.openRoomCreationDialog = false;

    this.socket.emit(LobbySocketEvent.GameCreated.toString(), {
      characterExtensions: [
        GameCharacterExtensions.Standard,
        GameCharacterExtensions.Wind,
        GameCharacterExtensions.Fire,
        GameCharacterExtensions.Forest,
        GameCharacterExtensions.Mountain,
        GameCharacterExtensions.God,
        GameCharacterExtensions.YiJiang2011,
      ],
      cardExtensions: [GameCardExtensions.Standard, GameCardExtensions.LegionFight],
      ...roomInfo,
    });
  };

  @mobx.action
  private readonly onRoomCreationCancelled = () => {
    this.openRoomCreationDialog = false;
  };

  @mobx.action
  private readonly onClickSettings = () => {
    this.openSettings = true;
  };

  @mobx.action
  private readonly onCloseSettings = () => {
    this.openSettings = false;
  };

  @mobx.action
  private readonly onOpenAcknowledgement = () => {
    this.openAcknowledgement = true;
  };

  @mobx.action
  private readonly onCloseAcknowledgement = () => {
    this.openAcknowledgement = false;
  };

  render() {
    const username = window.localStorage.getItem('username');

    return (
      <div className={styles.lobby}>
        <img src={this.backgroundImage} alt="" className={styles.background} />
        <div className={styles.board}>
          <img className={styles.logo} src={logoImage} alt={'logo'} />
          <div className={styles.functionBoard}>
            <img src={this.illustrationImage} alt="" className={styles.illustration} />
            <Button
              variant="primary"
              className={styles.button}
              onClick={this.onClickRefresh}
              disabled={this.unmatchedCoreVersion}
            >
              {this.props.translator.tr('Refresh room list')}
            </Button>
          </div>
          <div className={classNames(styles.roomList, { [styles.unavailable]: !username })}>
            {this.roomList.length === 0 && <span>{this.props.translator.tr('No rooms at the moment')}</span>}
            {this.unmatchedCoreVersion
              ? this.unmatchedView()
              : this.roomList.map((roomInfo, index) => (
                  <li className={styles.roomInfo} key={index}>
                    <span>{roomInfo.name}</span>
                    <img
                      className={styles.gameModeIcon}
                      src={this.props.imageLoader.getGameModeIcon(roomInfo.gameMode).src}
                      alt=""
                    />
                    <span>{this.props.translator.tr(roomInfo.status)}</span>
                    <span>{`${roomInfo.activePlayers}/${roomInfo.totalPlayers}`}</span>
                    <span className={styles.roomActions}>
                      <LinkButton
                        onClick={this.enterRoom(roomInfo)}
                        disabled={roomInfo.activePlayers === roomInfo.totalPlayers || !username}
                      >
                        {this.props.translator.tr('Join')}
                      </LinkButton>
                    </span>
                  </li>
                ))}
            <CreateRoomButton
              imageLoader={this.props.imageLoader}
              onClick={this.onCreateRoom}
              className={styles.createRoomButton}
              image={this.createRoomImage}
              disabled={!username || this.unmatchedCoreVersion}
            />
            <img src={this.roomListBackgroundImage} alt="" className={styles.roomListBackground} />
          </div>
          <div className={styles.systemButtons}>
            <button className={styles.systemButton} disabled>
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.Record)}
                className={classNames(styles.lobbyButtonIcon, {
                  [styles.disabled]: true,
                })}
                alt=""
              />
            </button>
            <button className={styles.systemButton} disabled>
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.CharactersList)}
                className={classNames(styles.lobbyButtonIcon, {
                  [styles.disabled]: true,
                })}
                alt=""
              />
            </button>
            <button className={styles.systemButton} onClick={this.onClickSettings}>
              {!username && (
                <Tooltip autoAnimation position={['top']}>{this.props.translator.tr('please input your username here')}</Tooltip>
              )}
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.Settings)}
                className={styles.lobbyButtonIcon}
                alt=""
              />
            </button>
            <button className={styles.systemButton} disabled>
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.Feedback)}
                className={classNames(styles.lobbyButtonIcon, {
                  [styles.disabled]: true,
                })}
                alt=""
              />
            </button>
            <button className={styles.systemButton} onClick={this.onOpenAcknowledgement}>
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.Acknowledgement)}
                className={styles.lobbyButtonIcon}
                alt=""
              />
            </button>
          </div>
        </div>
        <div className={styles.chatInfo}></div>
        {this.openRoomCreationDialog && (
          <CreatRoomDialog
            imageLoader={this.props.imageLoader}
            translator={this.props.translator}
            onSubmit={this.onRoomCreated}
            onCancel={this.onRoomCreationCancelled}
          />
        )}
        {this.openSettings && (
          <SettingsDialog
            defaultGameVolume={this.defaultGameVolume}
            defaultMainVolume={this.defaultMainVolume}
            imageLoader={this.props.imageLoader}
            translator={this.props.translator}
            onMainVolumeChange={this.settings.onMainVolumeChange}
            onGameVolumeChange={this.settings.onVolumeChange}
            onConfirm={this.onCloseSettings}
          />
        )}
        {this.openAcknowledgement && (
          <AcknowledgeDialog imageLoader={this.props.imageLoader} onClose={this.onCloseAcknowledgement} />
        )}
      </div>
    );
  }
}
