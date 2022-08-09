import { AudioLoader } from 'audio_loader/audio_loader';
import { WaitingRoomEvent } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameInfo } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
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
  private isCampaignMode = false;
  @mobx.observable.ref
  private roomIdString: string;
  @mobx.observable.ref
  private gameHostedServer: ServerHostTag;

  private socket: SocketIOClient.Socket;
  private isHost: boolean;
  private services: ReturnType<typeof installServices>;

  private presenter = new WaitingRoomPresenter();
  private store = this.presenter.createStore();

  constructor(props: WaitingRoomProps) {
    super(props);
    const { match, electronLoader } = this.props;

    const { campaignMode, hostPlayerId, roomName, ping, passcode } = this.props.location.state as {
      campaignMode?: boolean;
      roomName: string;
      hostPlayerId: string;
      ping: number;
      passcode?: string;
      hostConfig: ServiceConfig;
    };

    if (!match.params.slug) {
      this.backwardsToLoddy();
    }

    mobx.runInAction(() => {
      this.roomIdString = match.params.slug;
      this.isCampaignMode = !!campaignMode;
      this.isHost = hostPlayerId === electronLoader.getTemporaryData(ElectronData.PlayerId);
    });

    if (this.isCampaignMode) {
      // @TODO(donle) add campagin mode process here
    } else {
      this.connectToServer();
    }

    this.services = installServices(
      this.socket,
      this.props.translator,
      this.props.imageLoader,
      this.props.audioLoader,
      this.props.electronLoader,
      this.presenter,
      this.store,
      this.props.electronLoader.getTemporaryData(ElectronData.PlayerId) || this.props.translator.tr('unknown'),
      this.backwardsToLoddy,
      this.joinIntoTheGame(hostPlayerId, ping),
    );

    this.createGame(hostPlayerId, roomName, passcode);
  }

  private readonly backwardsToLoddy = () => {
    this.props.history.push('/lobby');
  };

  private readonly joinIntoTheGame = (hostPlayerId: string, ping: number) => (roomId: RoomId, roomInfo: GameInfo) => {
    const hostConfig = this.props.config.host.find(config => config.hostTag === this.gameHostedServer);

    this.props.history.push(`/room/${roomId}`, {
      gameMode: roomInfo.gameMode,
      ping,
      hostConfig,
      hostPlayerId,
    });
  };

  private connectToServer() {
    const { hostConfig } = this.props.location.state as {
      hostConfig: ServiceConfig;
    };

    this.socket = IOSocketClient(
      `${hostConfig.protocol}://${hostConfig.host}:${hostConfig.port}/waiting-room-${this.roomIdString}`,
    );
    mobx.runInAction(() => (this.gameHostedServer = hostConfig.hostTag));
  }

  private createGame(hostPlayerId: string, roomName: string, passcode?: string) {
    this.services.eventSenderService.broadcast(WaitingRoomEvent.RoomCreated, {
      hostPlayerId,
      roomInfo: {
        numberOfPlayers: WaitingRoomPresenter.defaultNumberOfPlayers,
        roomName,
        hostPlayerId,
        coreVersion: Sanguosha.Version,
        ...this.store.gameSettings,
        passcode,
      },
    });
  }

  render() {
    const { match, location, ...props } = this.props;
    const { roomName, ping } = location.state as {
      campaignMode?: boolean;
      roomName: string;
      hostPlayerId: string;
      ping: number;
      hostConfig?: ServiceConfig;
    };

    return (
      <div className={styles.waitingRoom}>
        <Background imageLoader={this.props.imageLoader} />
        <HeaderBar
          {...props}
          isCampaignMode={this.isCampaignMode}
          audioService={this.services.audioService}
          roomName={roomName}
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
            presenter={this.presenter}
            store={this.store}
            controlable={this.isHost}
          />
        </div>
      </div>
    );
  }
}
