import { AudioLoader } from 'audio_loader/audio_loader';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { Background } from 'pages/room/ui/background/background';
import { Banner } from 'pages/room/ui/banner/banner';
import { SettingsDialog } from 'pages/ui/settings/settings';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { AudioService } from 'ui/audio/install';
import styles from './header_bard.module.css';

export type HeaderBarProps = {
  electronLoader: ElectronLoader;
  audioLoader: AudioLoader;
  imageLoader: ImageLoader;
  isCampaignMode: boolean;
  translator: ClientTranslationModule;
  audioService: AudioService;
  roomName: string;
  roomId?: number | string;
  defaultPing?: number;
  getConnectionService(campaignMode: boolean): ConnectionService;
};

@mobxReact.observer
export class HeaderBar extends React.Component<HeaderBarProps> {
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

  private readonly settings = {
    onVolumeChange: mobx.action((volume: number) => {
      this.props.electronLoader.setData('gameVolume', volume.toString());
      this.defaultGameVolume = volume;
      this.props.audioService.changeGameVolume();
    }),
    onMainVolumeChange: mobx.action((volume: number) => {
      this.props.electronLoader.setData('mainVolume', volume.toString());
      this.defaultMainVolume = volume;
      this.props.audioService.changeBGMVolume();
    }),
  };

  render() {
    return (
      <>
        <Background imageLoader={this.props.imageLoader} />

        <Banner
          translator={this.props.translator}
          roomName={this.props.roomName}
          defaultPing={this.props.defaultPing}
          className={styles.roomBanner}
          connectionService={this.props.getConnectionService(this.props.isCampaignMode)}
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
      </>
    );
  }
}
