import { AudioLoader } from 'audio_loader/audio_loader';
import { ClientPlayer } from 'core/player/player.client';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import { Background } from 'pages/room/ui/background/background';
import { Banner } from 'pages/room/ui/banner/banner';
import { SettingsDialog } from 'pages/ui/settings/settings';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { PagePropsWithConfig } from 'types/page_props';
import { installAudioPlayerService } from 'ui/audio/install';
import styles from './waiting_room.module.css';

type WaitingRoomProps = PagePropsWithConfig<{
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
  electronLoader: ElectronLoader;
  getConnectionService(campaignMode: boolean): ConnectionService;
}>;

export class WaitingRoom extends React.Component<WaitingRoomProps> {
  private isCampaignMode = false;
  private roomName: string;

  private roomPlayers: ClientPlayer[] = [];

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
  @mobx.action
  private readonly onClickSettings = () => {
    this.openSettings = true;
  };
  @mobx.action
  private readonly onCloseSettings = () => {
    this.openSettings = false;
  };

  private audioService = installAudioPlayerService(this.props.audioLoader, this.props.electronLoader);

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

  componentDidMount() {
    const { roomName, campaignMode } = this.props.location.state as {
      campaignMode?: boolean;
      roomName: string;
    };

    this.roomName = roomName;
    this.isCampaignMode = !!campaignMode;
  }

  render() {
    return (
      <div className={styles.waitingRoom}>
        <Background imageLoader={this.props.imageLoader} />

        <Banner
          translator={this.props.translator}
          roomName={this.roomName}
          className={styles.roomBanner}
          connectionService={this.props.getConnectionService(this.isCampaignMode)}
          onClickSettings={this.onClickSettings}
        />

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
