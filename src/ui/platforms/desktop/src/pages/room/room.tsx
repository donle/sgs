import { AudioLoader } from 'audio_loader/audio_loader';
import { clientActiveListenerEvents, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { LocalClientEmitter } from 'core/network/local/local_emitter.client';
import { ClientSocket } from 'core/network/socket.client';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { RoomMode } from 'core/shares/types/room_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronData } from 'electron_loader/electron_data';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { SettingsDialog } from 'pages/ui/settings/settings';
import { ServerHostTag, ServiceConfig } from 'props/config_props';
import * as React from 'react';
import { match } from 'react-router-dom';
import { ConnectionService } from 'services/connection_service/connection_service';
import { CharacterSkinInfo } from 'skins/skins';
import { PagePropsWithConfig } from 'types/page_props';
import { installAudioPlayerService } from 'ui/audio/install';
import { GameClientProcessor } from './game_processor';
import { installService, RoomBaseService } from './install_service';
import styles from './room.module.css';
import { RoomPresenter } from './room.presenter';
import { RoomStore } from './room.store';
import { Background } from './ui/background/background';
import { Banner } from './ui/banner/banner';
import { Dashboard } from './ui/dashboard/dashboard';
import { GameBoard } from './ui/gameboard/gameboard';
import { GameDialog } from './ui/game_dialog/game_dialog';
import { SeatsLayout } from './ui/seats_layout/seats_layout';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithConfig<{
    match: match<{ slug: string }>;
    translator: ClientTranslationModule;
    imageLoader: ImageLoader;
    audioLoader: AudioLoader;
    electronLoader: ElectronLoader;
    getConnectionService(campaignMode: boolean): ConnectionService;
    skinData?: CharacterSkinInfo[];
  }>
> {
  private presenter: RoomPresenter;
  private store: RoomStore;
  private socket: ClientSocket;
  private gameProcessor: GameClientProcessor;
  private roomId: number;
  private playerName: string = this.props.electronLoader.getData(ElectronData.PlayerName) || 'unknown';
  private playerId: PlayerId = Precondition.exists(
    this.props.electronLoader.getTemporaryData(ElectronData.PlayerId),
    'unknown player id',
  );
  private baseService: RoomBaseService;
  private audioService = installAudioPlayerService(this.props.audioLoader, this.props.electronLoader);
  private roomMode: RoomMode;
  private connectionService: ConnectionService;

  private lastEventTimeStamp: number;

  @mobx.observable.ref
  private roomPing: number = 999;
  @mobx.observable.ref
  private gameHostedServer: ServerHostTag;
  @mobx.observable.ref
  openSettings = false;
  @mobx.observable.ref
  private defaultMainVolume = this.props.electronLoader.getData(ElectronData.MainVolume)
    ? Number.parseInt(this.props.electronLoader.getData(ElectronData.MainVolume), 10)
    : 50;
  @mobx.observable.ref
  private defaultGameVolume = this.props.electronLoader.getData(ElectronData.GameVolume)
    ? Number.parseInt(this.props.electronLoader.getData(ElectronData.GameVolume), 10)
    : 50;
  @mobx.observable.ref
  private renderSideBoard = true;

  private readonly settings = {
    onVolumeChange: mobx.action((volume: number) => {
      this.props.electronLoader.setData(ElectronData.GameVolume, volume.toString());
      this.defaultGameVolume = volume;
      this.audioService.changeGameVolume();
    }),
    onMainVolumeChange: mobx.action((volume: number) => {
      this.props.electronLoader.setData(ElectronData.MainVolume, volume.toString());
      this.defaultMainVolume = volume;
      this.audioService.changeBGMVolume();
    }),
  };

  constructor(
    props: PagePropsWithConfig<{
      match: match<{ slug: string }>;
      translator: ClientTranslationModule;
      imageLoader: ImageLoader;
      audioLoader: AudioLoader;
      electronLoader: ElectronLoader;
      getConnectionService(campaignMode: boolean): ConnectionService;
      skinData?: CharacterSkinInfo[];
    }>,
  ) {
    super(props);
    const { match, translator } = this.props;

    this.roomId = parseInt(match.params.slug, 10);
    this.presenter = new RoomPresenter(this.props.imageLoader);
    this.store = this.presenter.createStore();

    const roomId = this.roomId.toString();
    const { ping, hostConfig, roomMode } = this.props.location.state as {
      ping?: number;
      hostConfig: ServiceConfig;
      roomMode: RoomMode;
    };
    this.roomMode = roomMode;
    this.connectionService = this.props.getConnectionService(this.roomMode === RoomMode.Campaign);

    if (this.roomMode === RoomMode.Campaign) {
      this.socket = new LocalClientEmitter((window as any).eventEmitter, roomId);
      mobx.runInAction(() => (this.gameHostedServer = ServerHostTag.Localhost));
    } else {
      this.socket = new ClientSocket(
        `${hostConfig.protocol}://${hostConfig.host}:${hostConfig.port}/room-${roomId}`,
        roomId,
      );
      mobx.runInAction(() => (this.gameHostedServer = hostConfig.hostTag));
    }

    if (ping !== undefined) {
      mobx.runInAction(() => (this.roomPing = ping));
    }

    this.baseService = installService(this.props.translator, this.store, this.props.imageLoader);
    this.gameProcessor = new GameClientProcessor(
      this.presenter,
      this.store,
      translator,
      this.props.imageLoader,
      this.audioService,
      this.props.electronLoader,
      this.props.skinData,
      this.createWaitingRoomCaller,
    );
  }

  private readonly createWaitingRoomCaller = (roomInfo: TemporaryRoomCreationInfo, roomId: number) => {
    this.props.history.push(`/waiting-room/${roomId}`, {
      ping: 0,
      hostConfig: this.props.config.host.find(host => host.hostTag === this.gameHostedServer),
    });
  };

  private readonly onHandleBulkEvents = async (events: ServerEventFinder<GameEventIdentifiers>[]) => {
    this.store.room.emitStatus('trusted', this.playerId!);
    for (const content of events) {
      const identifier = Precondition.exists(EventPacker.getIdentifier(content), 'Unable to load event identifier');
      await this.gameProcessor.onHandleIncomingEvent(identifier, content);
      this.showMessageFromEvent(content);
      this.updateGameStatus(content);
    }
  };

  componentDidMount() {
    this.audioService.playRoomBGM();
    this.presenter.setupRoomStatus({
      playerName: this.playerName,
      socket: this.socket,
      roomId: this.roomId,
      timestamp: Date.now(),
      playerId: this.playerId,
    });

    if (!this.playerId) {
      this.props.electronLoader.saveTemporaryData(ElectronData.PlayerId, `${this.playerName}-${Date.now()}`);
    }

    this.socket.on(GameEventIdentifiers.PlayerEnterRefusedEvent, () => {
      this.props.history.push('/lobby');
    });

    clientActiveListenerEvents().forEach(identifier => {
      this.socket.on(identifier, async (content: ServerEventFinder<GameEventIdentifiers>) => {
        const timestamp = EventPacker.getTimestamp(content);
        if (timestamp) {
          this.lastEventTimeStamp = timestamp;
        }

        if (identifier === GameEventIdentifiers.PlayerBulkPacketEvent) {
          await this.onHandleBulkEvents(
            (content as ServerEventFinder<GameEventIdentifiers.PlayerBulkPacketEvent>).stackedLostMessages,
          );
        } else {
          await this.gameProcessor.onHandleIncomingEvent(identifier, content);
          this.showMessageFromEvent(content);
          this.animation(identifier, content);
          this.updateGameStatus(content);
        }
      });
    });

    this.setupReconnection();
    this.joinRoom();

    window.addEventListener('beforeunload', () => this.disconnect());
  }

  private readonly setupReconnection = () => {
    this.socket.onReconnected(() => {
      const playerId = this.playerId;
      if (!playerId) {
        return;
      }

      this.socket.notify(
        GameEventIdentifiers.PlayerReenterEvent,
        EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerReenterEvent, {
          timestamp: this.lastEventTimeStamp,
          playerId,
          playerName: this.playerName,
        }),
      );
    });
  };

  private readonly joinRoom = () => {
    this.socket.notify(
      GameEventIdentifiers.PlayerEnterEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerEnterEvent, {
        playerName: this.playerName,
        timestamp: this.store.clientRoomInfo.timestamp,
        playerId: this.playerId!,
        coreVersion: Sanguosha.Version,
        joinAsObserver: this.roomMode === RoomMode.Observer,
      }),
    );
  };

  private readonly disconnect = () => {
    this.roomMode === RoomMode.Campaign
      ? this.socket.disconnect()
      : this.socket.notify(
          GameEventIdentifiers.PlayerLeaveEvent,
          EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerLeaveEvent, {
            playerId: this.store.clientPlayerId,
          }),
        );
  };

  componentWillUnmount() {
    this.disconnect();
    this.audioService.stop();
  }

  private updateGameStatus(event: ServerEventFinder<GameEventIdentifiers>) {
    const info = EventPacker.getGameRunningInfo(event);
    this.presenter.updateNumberOfDrawStack(info.numberOfDrawStack);
    this.presenter.updateGameCircle(info.circle);
  }

  private animation<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    this.baseService.Animation.GuideLineAnimation.animate(identifier, event);
    this.baseService.Animation.MoveInstantCardAnimation.animate(identifier, event);
  }

  private showMessageFromEvent(event: ServerEventFinder<GameEventIdentifiers>) {
    if (EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent) {
      for (const info of (event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos) {
        const { messages = [], translationsMessage, unengagedMessage, engagedPlayerIds } = info;
        const { translator } = this.props;

        if (unengagedMessage && engagedPlayerIds && !engagedPlayerIds.includes(this.store.clientPlayerId)) {
          messages.push(TranslationPack.create(unengagedMessage).toString());
        } else if (translationsMessage) {
          messages.push(TranslationPack.create(translationsMessage).toString());
        }

        messages.forEach(message => {
          this.presenter.addGameLog(translator.trx(message));
        });
      }
    } else {
      const { messages = [], translationsMessage, unengagedMessage, engagedPlayerIds } = event;
      const { translator } = this.props;

      if (unengagedMessage && engagedPlayerIds && !engagedPlayerIds.includes(this.store.clientPlayerId)) {
        messages.push(TranslationPack.create(unengagedMessage).toString());
      } else if (translationsMessage) {
        messages.push(TranslationPack.create(translationsMessage).toString());
      }

      messages.forEach(message => {
        this.presenter.addGameLog(translator.trx(message));
      });
    }
  }

  private readonly onTrusted = () => {
    this.gameProcessor.onPlayTrustedAction();
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
  private readonly onSwitchSideBoard = () => (this.renderSideBoard = !this.renderSideBoard);

  private readonly onChangeObserver = (player: Player) => {
    this.socket.notify(GameEventIdentifiers.ObserverRequestChangeEvent, {
      observerId: this.playerId,
      toObserverId: player.Id,
    });

    this.presenter.setupClientPlayerId(player.Id);
    this.props.translator.setupPlayer(player);
    this.presenter.broadcastUIUpdate();
  };

  render() {
    const observerMode = this.roomMode === RoomMode.Observer;
    const background = this.props.imageLoader.getBackgroundImage();

    return (
      <div className={styles.room}>
        <Background image={background} />
        {this.store.selectorDialog}
        {this.store.selectorViewDialog}

        <div className={styles.incomingConversation}>{this.store.incomingConversation}</div>
        {this.store.room && (
          <div className={styles.roomBoard}>
            <Banner
              roomIndex={this.roomId}
              translator={this.props.translator}
              roomName={this.store.room.getRoomInfo().name}
              className={styles.roomBanner}
              connectionService={this.connectionService}
              onClickSettings={this.onClickSettings}
              onSwitchSideBoard={this.onSwitchSideBoard}
              defaultPing={this.roomPing}
              host={this.gameHostedServer}
            />
            <div className={styles.mainBoard}>
              <SeatsLayout
                imageLoader={this.props.imageLoader}
                updateFlag={this.store.updateUIFlag}
                store={this.store}
                presenter={this.presenter}
                skinData={this.props.skinData}
                translator={this.props.translator}
                onClick={this.store.onClickPlayer}
                playerSelectableMatcher={this.store.playersSelectionMatcher}
                onRequestView={this.onChangeObserver}
                observerMode={observerMode}
              />
              {this.renderSideBoard && (
                <div className={styles.sideBoard}>
                  <GameBoard store={this.store} translator={this.props.translator} />
                  <GameDialog
                    store={this.store}
                    presenter={this.presenter}
                    translator={this.props.translator}
                    connectionService={this.connectionService}
                    replayOrObserverMode={observerMode}
                  />
                </div>
              )}
            </div>
            <Dashboard
              updateFlag={this.store.updateUIFlag}
              store={this.store}
              presenter={this.presenter}
              translator={this.props.translator}
              skinData={this.props.skinData}
              imageLoader={this.props.imageLoader}
              handcardHiddenMatcher={this.store.clientPlayerHandcardShowMatcher}
              cardEnableMatcher={this.store.clientPlayerCardActionsMatcher}
              outsideCardEnableMatcher={this.store.clientPlayerOutsideCardActionsMatcher}
              outsideCardShowMatcher={this.store.clientPlayerOutsideCardShowMatcher}
              onClickConfirmButton={this.store.confirmButtonAction}
              onClickCancelButton={this.store.cancelButtonAction}
              onClickFinishButton={this.store.finishButtonAction}
              onClick={this.store.onClickHandCardToPlay}
              onClickEquipment={this.store.onClickEquipmentToDoAction}
              onClickPlayer={this.store.onClickPlayer}
              onTrusted={this.onTrusted}
              cardSkillEnableMatcher={this.store.cardSkillsSelectionMatcher}
              playerSelectableMatcher={this.store.playersSelectionMatcher}
              onClickSkill={this.store.onClickSkill}
              isSkillDisabled={this.store.isSkillDisabled}
              observerMode={observerMode}
            />
          </div>
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
            electronLoader={this.props.electronLoader}
          />
        )}
      </div>
    );
  }
}
