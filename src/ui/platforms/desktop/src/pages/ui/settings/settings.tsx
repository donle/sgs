import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Dialog } from 'ui/dialog/dialog';
import { Slider } from 'ui/slider/slider';
import styles from './settings.module.css';

export type SettingsProps = {
  electronLoader: ElectronLoader;
  onMainVolumeChange(volume: number): void;
  onGameVolumeChange(volume: number): void;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  defaultMainVolume: number;
  defaultGameVolume: number;
  onConfirm(): void;
};

export const SettingsDialog = (props: SettingsProps) => {
  const [username, setUsername] = React.useState<string>(props.electronLoader.getData('username') || '');
  const onSubmit = () => {
    props.electronLoader.setData('username', username);
    props.onConfirm();
  };

  const onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
  };

  return (
    <Dialog className={styles.settings} onClose={props.onConfirm}>
      <img src={props.imageLoader.getDialogBackgroundImage().src} alt="" className={styles.background} />
      <Slider
        label={props.translator.tr('main volume')}
        className={styles.mainVolume}
        defaultValue={props.defaultMainVolume}
        onChange={props.onMainVolumeChange}
      />
      <Slider
        label={props.translator.tr('game volume')}
        className={styles.gameVolume}
        defaultValue={props.defaultGameVolume}
        onChange={props.onGameVolumeChange}
      />

      <div className={styles.inputField} onMouseDown={onMouseDown}>
        <span className={styles.inputLabelText}>{props.translator.tr('please enter your username')}</span>
        <input className={styles.input} value={username} onChange={onUsernameChange} />
      </div>

      <Button variant="primary" onClick={onSubmit} className={styles.confirm} disabled={!username}>
        {props.translator.tr('confirm')}
      </Button>
    </Dialog>
  );
};
