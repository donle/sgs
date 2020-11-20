import { GameMode } from 'core/shares/types/room_props';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Dialog } from 'ui/dialog/dialog';
import styles from './create_room_dialog.module.css';

export type TemporaryRoomCreationInfo = {
  numberOfPlayers: number;
  roomName: string;
  gameMode: GameMode;
};

export const CreatRoomDialog = (props: {
  translator: ClientTranslationModule;
  onSubmit(data: TemporaryRoomCreationInfo): void;
  onCancel(): void;
  imageLoader: ImageLoader;
}) => {
  const username = window.localStorage.getItem('username');
  const [numberOfPlayers, setNumberOfPlayers] = React.useState<number>(2);
  const [gameMode, setGameMode] = React.useState<GameMode>(GameMode.Standard);
  const [roomName, setRoomName] = React.useState<string>(
    username ? props.translator.tr(TranslationPack.translationJsonPatcher("{0}'s room", username).extract()) : '',
  );
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit({ numberOfPlayers, roomName, gameMode });
  };

  const onRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(event.target.value);
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

  return (
    <Dialog className={styles.createRoomDialog}>
      <img src={props.imageLoader.getDialogBackgroundImage().src} alt="bg" className={styles.background} />
      <form onSubmit={onSubmit} className={styles.creatRoomForm}>
        <div className={styles.inputField}>
          <span className={styles.inputLabelText}>{props.translator.tr('please enter your room name')}</span>
          <input className={styles.input} value={roomName} onChange={onRoomNameChange} />
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
