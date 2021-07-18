import { AudioLoader } from 'audio_loader/audio_loader';
import classNames from 'classnames';
import { clientActiveListenerEvents, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { ClientSocket } from 'core/network/socket.client';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { SettingsDialog } from 'pages/ui/settings/settings';
import { ServerHostTag, ServiceConfig } from 'props/config_props';
import * as React from 'react';
import { match } from 'react-router-dom';
import { ConnectionService } from 'services/connection_service/connection_service';
import { PagePropsWithConfig } from 'types/page_props';
import { installAudioPlayerService } from 'ui/audio/install';
import { ClientCard } from 'ui/card/card';
import { GameClientProcessor } from './game_processor';
import { installService, RoomBaseService } from './install_service';
import styles from './room.module.css';
import { RoomPresenter, RoomStore } from './room.presenter';
import { Background } from './ui/background/background';
import { Banner } from './ui/banner/banner';
import { Dashboard } from './ui/dashboard/dashboard';
import { GameBoard } from './ui/gameboard/gameboard';
import { GameDialog } from './ui/game_dialog/game_dialog';
import { SeatsLayout } from './ui/seats_layout/seats_layout';
import { CharacterSkinInfo } from 'skins/skins';

@mobxReact.observer
export class RoomPage extends React.Component<
  PagePropsWithConfig<{
    match: match<{ slug: string }>;
    translator: ClientTranslationModule;
    imageLoader: ImageLoader;
    audioLoader: AudioLoader;
    electronLoader: ElectronLoader;
    connectionService: ConnectionService;
    skinData: CharacterSkinInfo[];
  }>
> {
  private presenter: RoomPresenter;
  private store: RoomStore;
  private socket: ClientSocket;
  private gameProcessor: GameClientProcessor;
  private roomId: number;
  private playerName: string = this.props.electronLoader.getData('username') || 'unknown';
  private baseService: RoomBaseService;
  private audioService = installAudioPlayerService(this.props.audioLoader, this.props.electronLoader);

  private displayedCardsRef = React.createRef<HTMLDivElement>();
  private readonly cardWidth = 120;
  private readonly cardMargin = 2;
  private lastEventTimeStamp: number;

  @mobx.observable.ref
  private roomPing: number = 999;
  @mobx.observable.ref
  private gameHostedServer: ServerHostTag;
  @mobx.observable.ref
  private focusedCardIndex: number | undefined;
  @mobx.observable.ref
  openSettings = false;
  @mobx.observable.ref
  private defaultMainVolume = this.props.electronLoader.getData('mainVolume')
    ? Number.parseInt(this.props.electronLoader.getData('mainVolume'), 10)
    : 50;
  @mobx.observable.ref
  private defaultGameVolume = this.props.electronLoader.getData('gameVolume')
    ? Number.parseInt(this.props.electronLoader.getData('gameVolume'), 10)
    : 50;
  @mobx.observable.ref
  private renderSideBoard = true;

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

  constructor(
    props: PagePropsWithConfig<{
      match: match<{ slug: string }>;
      translator: ClientTranslationModule;
      imageLoader: ImageLoader;
      audioLoader: AudioLoader;
      electronLoader: ElectronLoader;
      connectionService: ConnectionService;
      skinData: CharacterSkinInfo[];
    }>,
  ) {
    super(props);
    const { match, translator } = this.props;

    this.roomId = parseInt(match.params.slug, 10);
    this.presenter = new RoomPresenter(this.props.imageLoader);
    this.store = this.presenter.createStore();

    const roomId = this.roomId.toString();
    const { ping, hostConfig } = this.props.location.state as { ping?: number; hostConfig: ServiceConfig };
    this.socket = new ClientSocket(
      `${hostConfig.protocol}://${hostConfig.host}:${hostConfig.port}/room-${roomId}`,
      roomId,
    );
    mobx.runInAction(() => (this.gameHostedServer = hostConfig.hostTag));

    if (ping !== undefined) {
      mobx.runInAction(() => (this.roomPing = ping));
    }

    this.baseService = installService(translator, this.store, this.props.imageLoader);
    this.gameProcessor = new GameClientProcessor(
      this.presenter,
      this.store,
      translator,
      this.props.imageLoader,
      this.audioService,
      this.props.electronLoader,
      this.props.skinData,
    );
  }

  private readonly onHandleBulkEvents = async (events: ServerEventFinder<GameEventIdentifiers>[]) => {
    this.store.room.emitStatus('trusted', this.props.electronLoader.getTemporaryData('playerId')!);
    for (const content of events) {
      const identifier = Precondition.exists(EventPacker.getIdentifier(content), 'Unable to load event identifier');
      await this.gameProcessor.onHandleIncomingEvent(identifier, content);
      this.showMessageFromEvent(content);
      this.updateGameStatus(content);
    }
  };

  componentDidMount() {
    this.audioService.stop();
    this.presenter.setupRoomStatus({
      playerName: this.playerName,
      socket: this.socket,
      roomId: this.roomId,
      timestamp: Date.now(),
    });

    this.socket.onReconnected(() => {
      const playerId = this.props.electronLoader.getTemporaryData('playerId');
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

    if (!this.props.electronLoader.getTemporaryData('playerId')) {
      this.props.electronLoader.saveTemporaryData('playerId', `${this.playerName}-${Date.now()}`);
    }

    this.socket.notify(
      GameEventIdentifiers.PlayerEnterEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerEnterEvent, {
        playerName: this.playerName,
        timestamp: this.store.clientRoomInfo.timestamp,
        playerId: this.props.electronLoader.getTemporaryData('playerId')!,
      }),
    );

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

    window.addEventListener('beforeunload', () => this.disconnect());
  }

  private readonly disconnect = () => {
    this.socket.notify(
      GameEventIdentifiers.PlayerLeaveEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerLeaveEvent, {
        playerId: this.store.clientPlayerId,
      }),
    );
    // this.socket.disconnect();
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
    this.baseService.Animation.MoveCardAnimation.animate(identifier, event);
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

  private calculateDisplayedCardOffset(totalCards: number, index: number) {
    const container = this.displayedCardsRef.current;
    if (!container) {
      return this.cardMargin;
    }

    const containerWidth = container.clientWidth;
    const innerOffset =
      Math.min(this.cardWidth * totalCards + this.cardMargin * (totalCards + 1), containerWidth) / 2 -
      this.cardWidth / 2;
    if (containerWidth < totalCards * (this.cardWidth + this.cardMargin)) {
      const offset = (totalCards * (this.cardWidth + this.cardMargin) - containerWidth) / (totalCards - 1);
      return (totalCards - index - 1) * (this.cardMargin + this.cardWidth - offset) - innerOffset;
    } else {
      return (totalCards - index - 1) * (this.cardMargin + this.cardWidth) + this.cardMargin * 2 - innerOffset;
    }
  }

  private readonly onDisplayCardFocused = (index: number) =>
    mobx.action(() => {
      this.focusedCardIndex = index;
    });

  @mobx.action
  private readonly onDisplayCardLeft = () => {
    this.focusedCardIndex = undefined;
  };

  private getDisplayedCard() {
    return (
      <div className={styles.displayedCards} ref={this.displayedCardsRef}>
        {this.store.displayedCards.map((displayCard, index) => (
          <ClientCard
            imageLoader={this.props.imageLoader}
            key={index}
            card={displayCard.card}
            tag={displayCard.tag}
            width={this.cardWidth}
            offsetLeft={this.calculateDisplayedCardOffset(this.store.displayedCards.length, index)}
            translator={this.props.translator}
            className={classNames(styles.displayedCard, {
              [styles.focused]: this.focusedCardIndex === index,
            })}
            onMouseEnter={this.onDisplayCardFocused(index)}
            onMouseLeave={this.onDisplayCardLeft}
          />
        ))}
      </div>
    );
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
    return (
      <div className={styles.room}>
        <Background imageLoader={this.props.imageLoader} />
        {this.store.selectorDialog}

        <div className={styles.incomingConversation}>{this.store.incomingConversation}</div>
        {this.store.room && (
          <div className={styles.roomBoard}>
            <Banner
              roomIndex={this.roomId}
              translator={this.props.translator}
              roomName={this.store.room.getRoomInfo().name}
              className={styles.roomBanner}
              connectionService={this.props.connectionService}
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
                gamePad={this.getDisplayedCard()}
              />
              {this.renderSideBoard && (
                <div className={styles.sideBoard}>
                  <GameBoard store={this.store} translator={this.props.translator} />
                  <GameDialog
                    store={this.store}
                    presenter={this.presenter}
                    translator={this.props.translator}
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
              cardEnableMatcher={this.store.clientPlayerCardActionsMatcher}
              outsideCardEnableMatcher={this.store.clientPlayerOutsideCardActionsMatcher}
              onClickConfirmButton={this.store.confirmButtonAction}
              onClickCancelButton={this.store.cancelButtonAction}
              onClickFinishButton={this.store.finishButtonAction}
              onClickReforgeButton={this.store.reforgeButtonAction}
              onClick={this.store.onClickHandCardToPlay}
              onClickEquipment={this.store.onClickEquipmentToDoAction}
              onClickPlayer={this.store.onClickPlayer}
              cardSkillEnableMatcher={this.store.cardSkillsSelectionMatcher}
              playerSelectableMatcher={this.store.playersSelectionMatcher}
              onClickSkill={this.store.onClickSkill}
              isSkillDisabled={this.store.isSkillDisabled}
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
