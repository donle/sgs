import logoImage from 'assets/images/lobby/logo.png';
import { AudioLoader } from 'audio_loader/audio_loader';
import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions } from 'core/game/game_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { SettingsDialog } from 'pages/ui/settings/settings';
import { LobbyButton } from 'props/game_props';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { PagePropsWithConfig } from 'types/page_props';
import { installAudioPlayerService } from 'ui/audio/install';
import { Button } from 'ui/button/button';
import { LinkButton } from 'ui/button/link_button';
import { SignalBar } from 'ui/signal_bar/signal_bar';
import { Tooltip } from 'ui/tooltip/tooltip';
import lockerImage from './images/locked.png';
import styles from './lobby.module.css';
import { AcknowledgeDialog } from './ui/acknowledge_dialog/acknowledge_dialog';
import { Chat } from './ui/chat/chat';
import { CreateRoomButton } from './ui/create_room_button/create_room_button';
import { CreateRoomDialog, TemporaryRoomCreationInfo } from './ui/create_room_dialog/create_room_dialog';
import { EnterPasscodeDialog } from './ui/enter_passcode_dialog/enter_passcode_dialog';
import { FeedbackDialog } from './ui/feedback_dialog/feedback_dialog';
import { ServerHostTag } from 'props/config_props';

type LobbyProps = PagePropsWithConfig<{
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
  electronLoader: ElectronLoader;
  connectionService: ConnectionService;
}>;

type HostRoomInfo = {
  info: RoomInfo;
  host: ServerHostTag;
  ping: number;
};

@mobxReact.observer
export class Lobby extends React.Component<LobbyProps> {
  @mobx.observable.shallow
  private roomList: { info: RoomInfo; host: ServerHostTag; ping: number }[] = [];
  @mobx.observable.ref
  private unmatchedCoreVersion = false;
  @mobx.observable.ref
  private openRoomCreationDialog = false;
  @mobx.observable.ref
  private openSettings = false;
  @mobx.observable.ref
  private openPasscodeEnterDialog = false;
  @mobx.observable.ref
  private openFeedback = false;
  @mobx.observable.ref
  private showPasscodeError = false;
  @mobx.observable.ref
  private defaultMainVolume = 50;
  @mobx.observable.ref
  private defaultGameVolume = 50;
  @mobx.observable.ref
  private openAcknowledgement = false;
  @mobx.observable.ref
  private username: string;
  @mobx.observable.ref
  private viewCharacterExtenstions: number | undefined;
  @mobx.observable.ref
  private updateTo: string;
  @mobx.observable.ref
  private updateComplete: boolean = false;
  @mobx.observable.ref
  private updateProgress: number = 0;
  @mobx.observable.ref
  private gameLog: string;

  private backgroundImage = this.props.imageLoader.getLobbyBackgroundImage().src!;
  private illustrationImage = this.props.imageLoader.getRandomLobbyIllustration().src!;
  private gameLogBoardImage = this.props.imageLoader.getGameLogBoradImage().src!;
  private roomListBackgroundImage = this.props.imageLoader.getRoomListBackgroundImage().src!;
  private createRoomImage = this.props.imageLoader.getCreateRoomButtonImage().src!;
  private audioService = installAudioPlayerService(this.props.audioLoader, this.props.electronLoader);

  private currentInteractiveRoomInfo: HostRoomInfo;

  private readonly settings = {
    onVolumeChange: mobx.action((volume: number) => {
      this.props.electronLoader.setData('gameVolume', volume.toString());
      this.defaultGameVolume = volume;
      this.audioService.changeGameVolume();
    }),
    onMainVolumeChange: mobx.action((volume: number) => {
      this.props.electronLoader.setData('mainVolume', volume.toString());
      this.defaultMainVolume = volume;
      this.audioService.changeBGMVolume();
    }),
  };

  @mobx.action
  componentDidMount() {
    this.props.electronLoader.refreshReplayDataFlow();
    !this.audioService.isPlayingLobbyBGM() && this.audioService.playLobbyBGM();
    this.defaultMainVolume = this.props.electronLoader.getData('mainVolume')
      ? Number.parseInt(this.props.electronLoader.getData('mainVolume'), 10)
      : 50;
    this.defaultGameVolume = this.props.electronLoader.getData('gameVolume')
      ? Number.parseInt(this.props.electronLoader.getData('gameVolume'), 10)
      : 50;
    this.username = this.props.electronLoader.getData('username');

    this.props.electronLoader.whenUpdate(
      mobx.action((nextVersion: string, progress: number, complete?: boolean) => {
        this.updateTo = nextVersion;
        this.updateComplete = !!complete;
        this.updateProgress = progress;
      }),
    );
    this.props.electronLoader.getGameLog().then(mobx.action(inlineHtml => (this.gameLog = inlineHtml)));
  }

  @mobx.action
  private queryRoomList() {
    this.roomList = [];
    this.props.connectionService.Lobby.getRoomList(
      mobx.action(content =>
        this.roomList.push(
          ...content.packet.map(roomInfo => ({ info: roomInfo, host: content.hostTag, ping: content.ping })),
        ),
      ),
    );
  }

  UNSAFE_componentWillMount() {
    this.queryRoomList();
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

    this.queryRoomList();
  };

  unmatchedView() {
    return <div>{this.props.translator.tr('Unmatched core version, please update your application')}</div>;
  }

  @mobx.action
  private readonly enterRoom = (hostInfo: HostRoomInfo) => () => {
    const { info, host } = hostInfo;
    if (info.passcode) {
      this.openPasscodeEnterDialog = true;
      this.currentInteractiveRoomInfo = hostInfo;
    } else {
      this.props.connectionService.Lobby.checkRoomExist(host, info.id, exist => {
        if (exist) {
          this.props.history.push(`/room/${info.id}`, {
            hostConfig: this.props.config.host.find(config => config.hostTag === this.currentInteractiveRoomInfo.host),
          });
        } else {
          //TODO: add error popout
          mobx.runInAction(() => {
            const deadRoomIndex = this.roomList.findIndex(
              roomHostInfo => roomHostInfo.info.id === this.currentInteractiveRoomInfo.info.id,
            );
            if (deadRoomIndex >= 0) {
              this.roomList.splice(deadRoomIndex, 1);
            }
          });
        }
      });
    }
  };

  @mobx.action
  private readonly onRoomCreated = (roomInfo: TemporaryRoomCreationInfo) => {
    this.openRoomCreationDialog = false;
    this.props.connectionService.Lobby.createGame(
      {
        cardExtensions: [GameCardExtensions.Standard, GameCardExtensions.LegionFight],
        ...roomInfo,
      },
      mobx.action(event => {
        const { packet, ping } = event;
        const { roomId, roomInfo } = packet;
        console.log(roomInfo);
        console.log(packet);
        this.props.history.push(`/room/${roomId}`, {
          gameMode: roomInfo.gameMode,
          ping,
          hostConfig: this.props.config.host.find(config => config.hostTag === this.currentInteractiveRoomInfo.host),
        });
      }),
    );
  };

  @mobx.action
  private readonly onRoomCreationCancelled = () => {
    this.openRoomCreationDialog = false;
  };

  @mobx.action
  private readonly onClickSettings = () => {
    this.openSettings = true;
  };

  private readonly onClickCharactersList = () => {
    this.props.history.push('/characters');
  };

  @mobx.action
  private readonly onCloseSettings = () => {
    this.username = this.props.electronLoader.getData('username');
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

  @mobx.action
  private readonly onPasscodeSubmit = (passcode?: string) => {
    if (this.currentInteractiveRoomInfo && passcode && this.currentInteractiveRoomInfo.info.passcode === passcode) {
      this.openPasscodeEnterDialog = false;
      this.showPasscodeError = false;
      this.props.connectionService.Lobby.checkRoomExist(
        this.currentInteractiveRoomInfo.host,
        this.currentInteractiveRoomInfo.info.id,
        exist => {
          if (exist) {
            this.props.history.push(`/room/${this.currentInteractiveRoomInfo.info.id}`, {
              hostConfig: this.props.config.host.find(
                config => config.hostTag === this.currentInteractiveRoomInfo.host,
              ),
            });
          } else {
            //TODO: add error popout
            mobx.runInAction(() => {
              const deadRoomIndex = this.roomList.findIndex(
                roomHostInfo => roomHostInfo.info.id === this.currentInteractiveRoomInfo.info.id,
              );
              if (deadRoomIndex >= 0) {
                this.roomList.splice(deadRoomIndex, 1);
              }
            });
          }
        },
      );
    } else {
      this.showPasscodeError = true;
    }
  };

  @mobx.action
  private readonly onPasscodeDialogClose = () => {
    this.openPasscodeEnterDialog = false;
    this.showPasscodeError = false;
  };

  @mobx.action
  private readonly onOpenFeedback = () => {
    this.openFeedback = true;
  };

  @mobx.action
  private readonly onFeedbackDialogClose = () => {
    this.openFeedback = false;
  };

  @mobx.action
  private readonly viewGameCharaterExtensions = (index: number) => () => {
    this.viewCharacterExtenstions = index;
  };
  @mobx.action
  private readonly closeGameCharaterExtensions = () => {
    this.viewCharacterExtenstions = undefined;
  };

  private readonly onOpenReplay = () => {
    this.props.electronLoader.readReplay(Sanguosha.Version).then(replay => {
      if (!replay) {
        return;
      }

      this.props.history.push('/replay', { replayData: replay });
    });
  };

  render() {
    return (
      <div className={styles.lobby}>
        <img src={this.backgroundImage} alt="" className={styles.background} />
        <div className={styles.board}>
          <div className={styles.functionBoard}>
            <div className={styles.illustration}>
              <img src={this.illustrationImage} alt="" />
              <img className={styles.logo} src={logoImage} alt={'logo'} />
            </div>
            <div className={styles.gameLog}>
              <div className={styles.gameLogContainer}>
                <img className={styles.gameLogBoardImage} src={this.gameLogBoardImage} alt="" />
                <p className={styles.gameLogText} dangerouslySetInnerHTML={{ __html: this.gameLog }} />
              </div>
            </div>
            <Button
              variant="primary"
              className={styles.button}
              onClick={this.onClickRefresh}
              disabled={this.unmatchedCoreVersion}
            >
              {this.props.translator.tr('Refresh room list')}
            </Button>
          </div>
          <div className={classNames(styles.roomList, { [styles.unavailable]: !this.username })}>
            {this.roomList.length === 0 && <span>{this.props.translator.tr('No rooms at the moment')}</span>}
            {this.unmatchedCoreVersion
              ? this.unmatchedView()
              : this.roomList.map((hostInfo, index) => (
                  <li className={styles.roomInfo} key={index}>
                    <span className={styles.roomName}>
                      <span>{hostInfo.info.name}</span>
                    </span>
                    <span
                      className={styles.roomMode}
                      onMouseEnter={this.viewGameCharaterExtensions(index)}
                      onMouseLeave={this.closeGameCharaterExtensions}
                    >
                      <img
                        className={styles.gameModeIcon}
                        src={this.props.imageLoader.getGameModeIcon(hostInfo.info.gameMode).src}
                        alt=""
                      />
                      {this.viewCharacterExtenstions === index && (
                        <Tooltip position={['slightBottom', 'right']}>
                          {hostInfo.info.packages.map(p => this.props.translator.tr(p)).join(', ')}
                        </Tooltip>
                      )}
                    </span>
                    <span className={styles.roomStatus}>{this.props.translator.tr(hostInfo.info.status)}</span>
                    <span
                      className={styles.roomPlayers}
                    >{`${hostInfo.info.activePlayers}/${hostInfo.info.totalPlayers}`}</span>
                    <span className={styles.roomLocker}>
                      {hostInfo.info.passcode && <img src={lockerImage} alt="" />}
                    </span>
                    <span className={styles.roomActions}>
                      <LinkButton
                        onClick={this.enterRoom(hostInfo)}
                        disabled={
                          hostInfo.info.activePlayers === hostInfo.info.totalPlayers ||
                          !this.username ||
                          hostInfo.info.status === 'playing'
                        }
                      >
                        {this.props.translator.tr('Join')}
                      </LinkButton>
                    </span>
                    <SignalBar
                      host={hostInfo.host}
                      className={styles.signalBar}
                      connectionService={this.props.connectionService}
                    />
                  </li>
                ))}
            <CreateRoomButton
              imageLoader={this.props.imageLoader}
              onClick={this.onCreateRoom}
              className={styles.createRoomButton}
              image={this.createRoomImage}
              disabled={!this.username || this.unmatchedCoreVersion}
            />
            <img src={this.roomListBackgroundImage} alt="" className={styles.roomListBackground} />
          </div>
          <div className={styles.systemButtons}>
            <button
              className={styles.systemButton}
              onClick={this.onOpenReplay}
              disabled={!this.props.electronLoader.ReplayEnabled}
            >
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.Record)}
                className={styles.lobbyButtonIcon}
                alt=""
              />
            </button>
            <button className={styles.systemButton} onClick={this.onClickCharactersList}>
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.CharactersList)}
                className={styles.lobbyButtonIcon}
                alt=""
              />
            </button>
            <button className={styles.systemButton} onClick={this.onClickSettings}>
              {!this.username && (
                <Tooltip autoAnimation position={['top']}>
                  {this.props.translator.tr('please input your username here')}
                </Tooltip>
              )}
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.Settings)}
                className={styles.lobbyButtonIcon}
                alt=""
              />
            </button>
            <button className={styles.systemButton} onClick={this.onOpenFeedback}>
              <img
                {...this.props.imageLoader.getLobbyButtonImage(LobbyButton.Feedback)}
                className={styles.lobbyButtonIcon}
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
          <Chat
            className={styles.chatSection}
            username={this.props.electronLoader.getData('username')}
            translator={this.props.translator}
            connectionService={this.props.connectionService}
          />
        </div>
        <div className={styles.chatInfo}></div>
        {this.openRoomCreationDialog && (
          <CreateRoomDialog
            imageLoader={this.props.imageLoader}
            translator={this.props.translator}
            electronLoader={this.props.electronLoader}
            onSubmit={this.onRoomCreated}
            onCancel={this.onRoomCreationCancelled}
          />
        )}
        {this.openSettings && (
          <SettingsDialog
            electronLoader={this.props.electronLoader}
            defaultGameVolume={this.defaultGameVolume}
            defaultMainVolume={this.defaultMainVolume}
            imageLoader={this.props.imageLoader}
            translator={this.props.translator}
            onMainVolumeChange={this.settings.onMainVolumeChange}
            onGameVolumeChange={this.settings.onVolumeChange}
            onConfirm={this.onCloseSettings}
          />
        )}
        {this.openPasscodeEnterDialog && (
          <EnterPasscodeDialog
            translator={this.props.translator}
            imageLoader={this.props.imageLoader}
            onSubmit={this.onPasscodeSubmit}
            onClose={this.onPasscodeDialogClose}
            showError={this.showPasscodeError}
          />
        )}
        {this.openFeedback && (
          <FeedbackDialog imageLoader={this.props.imageLoader} onClose={this.onFeedbackDialogClose} />
        )}
        {this.openAcknowledgement && (
          <AcknowledgeDialog imageLoader={this.props.imageLoader} onClose={this.onCloseAcknowledgement} />
        )}
        <div className={styles.version}>
          {this.updateTo && !this.updateComplete && (
            <span>
              {this.props.translator.trx(
                TranslationPack.translationJsonPatcher(
                  'updating core version to {0}, downloading...',
                  this.updateTo,
                ).toString(),
              )}
              {(this.updateProgress * 100).toFixed(2)} %
            </span>
          )}
          {this.updateComplete && (
            <span>{this.props.translator.tr('Update complete, please restart client to complete update')}</span>
          )}
          {this.props.translator.trx(
            TranslationPack.translationJsonPatcher('core version: {0}', Sanguosha.Version).toString(),
          )}
        </div>
      </div>
    );
  }
}
