import { AudioLoader } from 'audio_loader/audio_loader';
import { WaitingRoomEvent } from 'core/event/event';
import { GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { GameMode, RoomMode } from 'core/shares/types/room_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronData } from 'electron_loader/electron_data';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { Background } from 'pages/room/ui/background/background';
import { ServerHostTag, ServiceConfig } from 'props/config_props';
import * as React from 'react';
import { match } from 'react-router-dom';
import { ConnectionService } from 'services/connection_service/connection_service';
import IOSocketClient from 'socket.io-client';
import { PagePropsWithConfig } from 'types/page_props';
import { ChatBox } from './chat_box/chat_box';
import { GameSettings } from './game_settings/game_settings';
import { HeaderBar } from './header_bar/header_bar';
import { installServices } from './install';
import { Seats } from './seats/seats';
import styles from './waiting_room.module.css';
import { WaitingRoomPresenter } from './waiting_room.presenter';
import { WaitingRoomStore } from './waiting_room.store';

type WaitingRoomProps = PagePropsWithConfig<{
  match: match<{ slug: string }>;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
  electronLoader: ElectronLoader;
  getConnectionService(isCampaignMode: boolean): ConnectionService;
}>;

@mobxReact.observer
export class WaitingRoom extends React.Component<WaitingRoomProps> {
  @mobx.observable.ref
  private roomIdString: string;
  @mobx.observable.ref
  private gameHostedServer: ServerHostTag;
  @mobx.observable.ref
  private hostPlayerId: PlayerId;

  private socket: SocketIOClient.Socket;
  @mobx.observable.ref
  private isHost: boolean;
  private services: ReturnType<typeof installServices>;

  private selfPlayerId = Precondition.exists(
    this.props.electronLoader.getTemporaryData(ElectronData.PlayerId),
    'Unknown player id',
  );
  private selfPlayerName =
    this.props.electronLoader.getData<string>(ElectronData.PlayerName) || this.props.translator.tr('unknown');
  private roomName: string;

  private presenter = new WaitingRoomPresenter();
  private store: WaitingRoomStore = this.presenter.createStore(this.selfPlayerId);

  constructor(props: WaitingRoomProps) {
    super(props);
    const { match, electronLoader, translator, imageLoader, audioLoader } = this.props;

    const { ping, roomInfo, hostConfig } = this.props.location.state as {
      roomInfo?: TemporaryRoomCreationInfo;
      ping: number;
      hostConfig: ServiceConfig;
    };

    if (!match.params.slug) {
      this.backwardsToLoddy();
    }

    mobx.runInAction(() => {
      this.roomIdString = match.params.slug;
    });

    this.connectToServer(hostConfig);

    this.services = installServices(
      this.socket,
      translator,
      imageLoader,
      audioLoader,
      electronLoader,
      this.presenter,
      this.store,
      this.selfPlayerName,
      this.backwardsToLoddy,
      this.joinIntoTheGame(ping),
    );
    this.services.roomProcessorService.initWaitingRoomConnectionListeners();

    if (!roomInfo) {
      this.services.roomProcessorService.on(WaitingRoomEvent.PlayerEnter, content => {
        this.initWithRoomInfo(content.roomInfo);
      });

      this.presenter.initSeatsInfo(this.store);
      this.services.eventSenderService.enterRoom(
        this.selfPlayerId,
        this.services.avatarService.getRandomAvatarIndex(),
        this.selfPlayerName,
        false,
      );
    } else {
      this.initWithRoomInfo(roomInfo);
      this.services.eventSenderService.broadcast(WaitingRoomEvent.RoomCreated, {
        hostPlayerId: roomInfo.hostPlayerId,
        roomInfo,
      });
    }

    this.services.roomProcessorService.on(
      'hostChange',
      mobx.action(content => {
        this.isHost = content.newHostPlayerId === this.selfPlayerId;
      }),
    );
  }

  @mobx.action
  private initWithRoomInfo(roomInfo: TemporaryRoomCreationInfo) {
    const { roomName, campaignMode, coreVersion, hostPlayerId, ...settings } = roomInfo;
    this.isHost = this.selfPlayerId === hostPlayerId;
    this.roomName = roomName;

    this.hostPlayerId = hostPlayerId;
    this.presenter.updateGameSettings(this.store, settings);
    this.services.roomProcessorService.saveSettingsLocally();
  }

  private readonly backwardsToLoddy = () => {
    this.props.history.push('/lobby');
  };

  private readonly joinIntoTheGame = (ping: number) => (roomId: RoomId, roomInfo: GameInfo) => {
    const hostConfig = this.props.config.host.find(config => config.hostTag === this.gameHostedServer);

    this.props.history.push(`/room/${roomId}`, {
      gameMode: roomInfo.gameMode,
      ping,
      hostConfig,
      roomMode: RoomMode.Online,
    });
  };

  @mobx.action
  private connectToServer(hostConfig: ServiceConfig) {
    const endpoint = `${hostConfig.protocol}://${hostConfig.host}:${hostConfig.port}/waiting-room-${this.roomIdString}`;
    this.socket = IOSocketClient(endpoint, {
      reconnection: true,
      autoConnect: true,
      reconnectionAttempts: 3,
      timeout: 180000,
    });

    this.gameHostedServer = hostConfig.hostTag;
  }

  componentWillUnmount() {
    this.services.eventSenderService.leaveRoom(this.selfPlayerId);
    this.socket.disconnect();
  }

  @mobx.computed
  private get validSettings() {
    const allPlayers = this.store.seats.filter(seat => !seat.seatDisabled && seat.playerId != null);
    if (this.store.gameSettings.gameMode === GameMode.OneVersusTwo) {
      return allPlayers.length === 3;
    } else if (this.store.gameSettings.gameMode === GameMode.TwoVersusTwo) {
      return allPlayers.length === 4;
    } else if (this.store.gameSettings.gameMode === GameMode.Pve) {
      return allPlayers.length === 2;
    } else if (this.store.gameSettings.gameMode === GameMode.Standard) {
      return allPlayers.length > 1;
    }

    return true;
  }

  private readonly onSaveSettings = () => {
    this.services.eventSenderService.saveSettings(this.store.gameSettings);
    this.services.roomProcessorService.saveSettingsLocally();
  };

  render() {
    const { match, location, ...props } = this.props;
    const { ping } = location.state as {
      ping: number;
    };

    return (
      <div className={styles.waitingRoom}>
        <Background image={this.props.imageLoader.getWaitingRoomBackgroundImage()} />
        <HeaderBar
          {...props}
          isCampaignMode={false}
          audioService={this.services.audioService}
          roomName={this.roomName}
          roomId={this.roomIdString}
          defaultPing={ping}
          host={this.gameHostedServer}
          variant="waitingRoom"
        />
        <div className={styles.mainContainer}>
          <div className={styles.playersPanel}>
            <Seats
              className={styles.seats}
              senderService={this.services.eventSenderService}
              translator={props.translator}
              presenter={this.presenter}
              store={this.store}
              avatarService={this.services.avatarService}
              imageLoader={this.props.imageLoader}
              isHost={this.isHost}
              validToStartGame={this.validSettings}
              hostPlayerId={this.hostPlayerId}
              roomName={this.roomName}
            />
            <ChatBox
              translator={props.translator}
              senderService={this.services.eventSenderService}
              presenter={this.presenter}
              store={this.store}
              playerName={this.props.electronLoader.getData(ElectronData.PlayerName)}
            />
          </div>
          <GameSettings
            className={styles.gameSettings}
            translator={props.translator}
            imageLoader={props.imageLoader}
            presenter={this.presenter}
            store={this.store}
            controlable={this.isHost}
            onSave={this.onSaveSettings}
          />
        </div>
      </div>
    );
  }
}
