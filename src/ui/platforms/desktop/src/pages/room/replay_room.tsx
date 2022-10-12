import { AudioLoader } from 'audio_loader/audio_loader';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { ClientOfflineSocket } from 'core/network/socket.offline';
import { PlayerInfo } from 'core/player/player_props';
import { System } from 'core/shares/libs/system';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronData } from 'electron_loader/electron_data';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { SettingsDialog } from 'pages/ui/settings/settings';
import { ServerHostTag } from 'props/config_props';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { CharacterSkinInfo } from 'skins/skins';
import { PagePropsWithConfig } from 'types/page_props';
import { ReplayDataType } from 'types/replay_props';
import { installAudioPlayerService } from 'ui/audio/install';
import { ReplayClientProcessor } from './game_processor.replay';
import { installService, RoomBaseService } from './install_service';
import styles from './room.module.css';
import { RoomPresenter } from './room.presenter';
import { RoomStore } from './room.store';
import { Background } from './ui/background/background';
import { Banner } from './ui/banner/banner';
import { Dashboard } from './ui/dashboard/dashboard';
import { GameDialog } from './ui/game_dialog/game_dialog';
import { GameBoard } from './ui/gameboard/gameboard';
import { SeatsLayout } from './ui/seats_layout/seats_layout';

@mobxReact.observer
export class ReplayRoomPage extends React.Component<
  PagePropsWithConfig<{
    translator: ClientTranslationModule;
    imageLoader: ImageLoader;
    audioLoader: AudioLoader;
    electronLoader: ElectronLoader;
    connectionService: ConnectionService;
    skinData?: CharacterSkinInfo[];
  }>
> {
  private presenter: RoomPresenter;
  private store: RoomStore;
  private gameProcessor: ReplayClientProcessor;
  private baseService: RoomBaseService;
  private audioService = installAudioPlayerService(this.props.audioLoader, this.props.electronLoader);

  private replayStepDelay = 2000;
  private dumped = false;

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
      translator: ClientTranslationModule;
      imageLoader: ImageLoader;
      audioLoader: AudioLoader;
      electronLoader: ElectronLoader;
      connectionService: ConnectionService;
      skinData?: CharacterSkinInfo[];
    }>,
  ) {
    super(props);
    const { translator } = this.props;

    this.presenter = new RoomPresenter(this.props.imageLoader);
    this.store = this.presenter.createStore();

    this.baseService = installService(this.props.translator, this.store, this.props.imageLoader);
    this.gameProcessor = new ReplayClientProcessor(
      this.presenter,
      this.store,
      translator,
      this.props.imageLoader,
      this.audioService,
      this.props.electronLoader,
      this.props.skinData,
    );
  }

  private static readonly nonDelayedEvents: GameEventIdentifiers[] = [
    GameEventIdentifiers.PhaseChangeEvent,
    GameEventIdentifiers.PhaseStageChangeEvent,
    GameEventIdentifiers.PlayerBulkPacketEvent,
    GameEventIdentifiers.PlayerBulkPacketEvent,
    GameEventIdentifiers.MoveCardEvent,
    GameEventIdentifiers.DrawCardEvent,
    GameEventIdentifiers.DrunkEvent,
    GameEventIdentifiers.HpChangeEvent,
    GameEventIdentifiers.ChangeMaxHpEvent,
    GameEventIdentifiers.PlayerPropertiesChangeEvent,
    GameEventIdentifiers.ObtainSkillEvent,
    GameEventIdentifiers.LoseSkillEvent,
    GameEventIdentifiers.LoseHpEvent,
    GameEventIdentifiers.DamageEvent,
    GameEventIdentifiers.CustomGameDialog,
    GameEventIdentifiers.NotifyEvent,
    GameEventIdentifiers.UserMessageEvent,
    GameEventIdentifiers.HookUpSkillsEvent,
    GameEventIdentifiers.UnhookSkillsEvent,
  ];

  private async stepDelay(identifier: GameEventIdentifiers) {
    if (ReplayRoomPage.nonDelayedEvents.includes(identifier)) {
      await System.MainThread.sleep(0);
    } else {
      await System.MainThread.sleep(this.replayStepDelay);
    }
  }

  private async loadSteps(events: ServerEventFinder<GameEventIdentifiers>[]) {
    for (const content of events) {
      if (this.dumped) {
        break;
      }
      const identifier = EventPacker.getIdentifier(content)!;
      if (identifier === undefined) {
        // tslint:disable-next-line:no-console
        console.warn(`missing identifier: ${JSON.stringify(content, null, 2)}`);
        continue;
      }
      if (identifier === GameEventIdentifiers.PlayerBulkPacketEvent) {
        const { stackedLostMessages } = content as ServerEventFinder<GameEventIdentifiers.PlayerBulkPacketEvent>;
        await this.loadSteps(stackedLostMessages);
      } else {
        await this.gameProcessor.onHandleIncomingEvent(identifier, content);
        this.showMessageFromEvent(content);
        this.animation(identifier, content);
        this.updateGameStatus(content);
        await this.stepDelay(identifier);
      }
    }
  }

  componentDidMount() {
    this.audioService.playRoomBGM();
    const { replayData } = this.props.location.state as { replayData: ReplayDataType };
    if (!replayData) {
      this.props.history.push('/lobby');
    }

    this.presenter.setupClientPlayerId(replayData.viewerId);
    this.presenter.createClientRoom(
      replayData.roomId,
      new ClientOfflineSocket(replayData.roomId.toString()),
      replayData.gameInfo,
      replayData.playersInfo as PlayerInfo[],
    );
    this.props.translator.setupPlayer(this.presenter.ClientPlayer);
    this.store.animationPosition.insertPlayer(replayData.viewerId);

    this.loadSteps(replayData.events);
  }

  componentWillUnmount() {
    this.dumped = true;
    this.audioService.stop();
  }

  private updateGameStatus(event: ServerEventFinder<GameEventIdentifiers>) {
    const info = EventPacker.getGameRunningInfo(event);
    this.presenter.updateNumberOfDrawStack(info.numberOfDrawStack);
    this.presenter.updateGameCircle(info.circle);
  }

  private animation<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    this.baseService.Animation.GuideLineAnimation.animate(identifier, event);
  }

  private showMessageFromEvent(event: ServerEventFinder<GameEventIdentifiers>) {
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

  render() {
    const { replayData } = this.props.location.state as { replayData: ReplayDataType };
    const background = this.props.imageLoader.getBackgroundImage();

    return (
      <div className={styles.room}>
        <Background image={background} />
        {this.store.selectorDialog}

        <div className={styles.incomingConversation}>{this.store.incomingConversation}</div>
        {this.store.room && (
          <div className={styles.roomBoard}>
            <Banner
              roomIndex={replayData.roomId}
              translator={this.props.translator}
              roomName={this.store.room.getRoomInfo().name}
              className={styles.roomBanner}
              connectionService={this.props.connectionService}
              onClickSettings={this.onClickSettings}
              onSwitchSideBoard={this.onSwitchSideBoard}
              host={ServerHostTag.Localhost}
            />
            <div className={styles.mainBoard}>
              <SeatsLayout
                imageLoader={this.props.imageLoader}
                updateFlag={this.store.updateUIFlag}
                store={this.store}
                skinData={this.props.skinData}
                presenter={this.presenter}
                translator={this.props.translator}
              />
              {this.renderSideBoard && (
                <div className={styles.sideBoard}>
                  <GameBoard store={this.store} translator={this.props.translator} />
                  <GameDialog
                    store={this.store}
                    presenter={this.presenter}
                    translator={this.props.translator}
                    replayOrObserverMode={true}
                    connectionService={this.props.connectionService}
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
              onClick={this.store.onClickHandCardToPlay}
              isSkillDisabled={this.store.isSkillDisabled}
              observerMode={false}
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
