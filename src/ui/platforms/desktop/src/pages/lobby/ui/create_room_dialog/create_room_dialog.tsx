import { GameMode } from 'core/shares/types/room_props';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Dialog } from 'ui/dialog/dialog';
import styles from './create_room_dialog.module.css';

export type TemporaryRoomCreationInfo = {
  numberOfPlayers: number;
  roomName: string;
  gameMode: GameMode;
  passcode?: string;
};

export const CreatRoomDialog = (props: {
  translator: ClientTranslationModule;
  onSubmit(data: TemporaryRoomCreationInfo): void;
  onCancel(): void;
  imageLoader: ImageLoader;
  electronLoader: ElectronLoader;
}) => {
  const username: string = props.electronLoader.getData('username');
  const [numberOfPlayers, setNumberOfPlayers] = React.useState<number>(2);
  const [gameMode] = React.useState<GameMode>(GameMode.Standard);
  const [passcode, setPasscode] = React.useState<string>();
  const [roomName, setRoomName] = React.useState<string>(
    username ? props.translator.tr(TranslationPack.translationJsonPatcher("{0}'s room", username).extract()) : '',
  );
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit({ numberOfPlayers, roomName, gameMode, passcode });
  };

  const onRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
  };
  const onPasscodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(event.target.value);
  };
  const onNumberOfPlayersChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNumberOfPlayers(parseInt(event.target.value, 10));
  };

  const getPlayerOptions = () => {
    const options: { content: string | PatchedTranslationObject; value: number }[] = [];
    for (let i = 2; i <= 8; i++) {
      options.push({ content: TranslationPack.translationJsonPatcher('{0} players', i).extract(), value: i });
    }

    return options;
  };

  const onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  return (
    <Dialog className={styles.createRoomDialog}>
      <img src={props.imageLoader.getDialogBackgroundImage().src} alt="bg" className={styles.background} />
      <form onSubmit={onSubmit} className={styles.creatRoomForm} onMouseDown={onAction}>
        <div className={styles.inputField}>
          <span className={styles.inputLabelText}>{props.translator.tr('please enter your room name')}</span>
          <input className={styles.input} value={roomName} onChange={onRoomNameChange} />
        </div>
        <div className={styles.inputField}>
          <span className={styles.inputLabelText}>{props.translator.tr('please enter your room passcode')}</span>
          <input className={styles.input} value={passcode} onChange={onPasscodeChange} />
        </div>
        <div className={styles.inputField}>
          <span className={styles.inputLabelText}>{props.translator.tr('please choose number of players')}</span>
          <select className={styles.input} value={numberOfPlayers} onChange={onNumberOfPlayersChange}>
            {getPlayerOptions().map(option => (
              <option value={option.value}>{props.translator.tr(option.content)}</option>
            ))}
          </select>
        </div>
        <div className={styles.submitSection}>
          <Button variant="primary" type="submit">
            {props.translator.tr('confirm')}
          </Button>
          <Button variant="primary" type="button" onClick={props.onCancel}>
            {props.translator.tr('cancel')}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
