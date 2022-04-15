import { AudioLoader } from 'audio_loader/audio_loader';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { ServiceConfig } from 'props/config_props';
import * as React from 'react';
import { match } from 'react-router-dom';
import { ConnectionService } from 'services/connection_service/connection_service';
import { PagePropsWithConfig } from 'types/page_props';
import { HeaderBar } from './header_bar/header_bar';
import { installServices } from './install';
import styles from './waiting_room.module.css';

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
  private roomId: RoomId;

  private hostPlayerId: PlayerId;
  private services = installServices(this.props.imageLoader, this.props.audioLoader, this.props.electronLoader);

  constructor(props: WaitingRoomProps) {
    super(props);
    const { match } = this.props;

    const { campaignMode, hostPlayerId } = this.props.location.state as {
      campaignMode?: boolean;
      roomName: string;
      hostPlayerId: string;
      ping: number;
      hostConfig?: ServiceConfig;
    };

    mobx.runInAction(() => {
      this.roomId = parseInt(match.params.slug, 10);
      this.isCampaignMode = !!campaignMode;
      this.hostPlayerId = hostPlayerId;
    });

    if (this.isCampaignMode) {
      // @TODO(donle) add campagin mode process here
    } else {
    }
  }

  render() {
    const { match, ...props } = this.props;
    const { roomName, ping } = this.props.location.state as {
      campaignMode?: boolean;
      roomName: string;
      hostPlayerId: string;
      ping: number;
      hostConfig?: ServiceConfig;
    };

    return (
      <div className={styles.waitingRoom}>
        <HeaderBar
          {...props}
          isCampaignMode={this.isCampaignMode}
          audioService={this.services.audioService}
          roomName={roomName}
          roomId={this.roomId}
          defaultPing={ping}
        />
      </div>
    );
  }
}
