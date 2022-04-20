import { AudioLoader } from 'audio_loader/audio_loader';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
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
  getConnectionService(campaignMode: boolean): ConnectionService;
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

    const { campaignMode, hostPlayerId } = this.props.location.state as {
      campaignMode?: boolean;
      roomName: string;
      hostPlayerId: string;
      ping: number;
      hostConfig: ServiceConfig;
    };

    if (!match.params.slug) {
      this.props.history.push('/lobby');
    }

    mobx.runInAction(() => {
      this.roomIdString = match.params.slug;
      this.isCampaignMode = !!campaignMode;
      this.isHost = hostPlayerId === electronLoader.getTemporaryData('playerId');
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
    );
  }

  private connectToServer() {
    const { hostConfig } = this.props.location.state as {
      hostConfig: ServiceConfig;
    };

    this.socket = IOSocketClient(
      `${hostConfig.protocol}://${hostConfig.host}:${hostConfig.port}/waiting-room-${this.roomIdString}`,
    );
    mobx.runInAction(() => (this.gameHostedServer = hostConfig.hostTag));
  }

  componentDidMount() {
    this.presenter.initSeatsInfo(this.store);
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
        />
        <div className={styles.mainContainer}>
          <Seats
            senderService={this.services.eventSenderService}
            translator={props.translator}
            presenter={this.presenter}
            store={this.store}
            avatarService={this.services.avatarService}
            imageLoader={this.props.imageLoader}
          />
          <ChatBox translator={props.translator} presenter={this.presenter} store={this.store} />
        </div>
        <div className={styles.gameSettings}>
          <GameSettings
            translator={props.translator}
            presenter={this.presenter}
            store={this.store}
            controlable={this.isHost}
            senderService={this.services.eventSenderService}
          />
        </div>
      </div>
    );
  }
}
