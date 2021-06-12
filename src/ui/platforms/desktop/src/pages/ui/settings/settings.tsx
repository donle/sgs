import { getAllLanguages, Languages } from 'core/translations/translation_json_tool';
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
  const [language, setLanguage] = React.useState<Languages>(props.electronLoader.getData('language'));
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

  const onChangeLanguge = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.electronLoader.setData('language', event.currentTarget.value);
    setLanguage(event.currentTarget.value as Languages);
  };

  const getLanguageText = () => {
    return language;
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

      <div className={styles.manuallyInput}>
        <div className={styles.inputField} onMouseDown={onMouseDown}>
          <span className={styles.inputLabelText}>{props.translator.tr('please enter your username')}</span>
          <input className={styles.input} value={username} onChange={onUsernameChange} />
        </div>

        <div className={styles.inputField}>
          <span className={styles.inputLabelText}>{props.translator.tr('game language')}</span>
          <select className={styles.input} value={getLanguageText()} onChange={onChangeLanguge}>
            {getAllLanguages().map((option, index) => (
              <option key={index} value={option} disabled={option === Languages.EN_US}>
                {props.translator.tr(option)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button variant="primary" onClick={onSubmit} className={styles.confirm} disabled={!username}>
        {props.translator.tr('confirm')}
      </Button>
    </Dialog>
  );
};
