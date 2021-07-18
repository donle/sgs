import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { Dialog } from 'ui/dialog/dialog';
import styles from './create_room_dialog.module.css';

function getGameModeOptions(translator: ClientTranslationModule) {
  return [
    {
      label: translator.tr(GameMode.Standard),
      id: GameMode.Standard,
      checked: false,
    },
    {
      label: translator.tr(GameMode.OneVersusTwo),
      id: GameMode.OneVersusTwo,
      checked: false,
    },
    {
      label: translator.tr(GameMode.TwoVersusTwo),
      id: GameMode.TwoVersusTwo,
      checked: false,
    },
    {
      label: translator.tr(GameMode.Hegemony),
      id: GameMode.Hegemony,
      checked: false,
      disabled: true,
    },
    {
      label: translator.tr(GameMode.Pve),
      id: GameMode.Pve,
      checked: true,
      disabled: false,
    },
  ];
}

function getGameCharacterExtensions(translator: ClientTranslationModule) {
  return Sanguosha.getGameCharacterExtensions().map(extension => ({
    id: extension,
    label: translator.tr(extension),
    checked: true,
    disabled: extension === GameCharacterExtensions.Standard,
  }));
}

export type TemporaryRoomCreationInfo = {
  numberOfPlayers: number;
  roomName: string;
  gameMode: GameMode;
  passcode?: string;
  characterExtensions: GameCharacterExtensions[];
};

export const CreateRoomDialog = (props: {
  translator: ClientTranslationModule;
  onSubmit(data: TemporaryRoomCreationInfo): void;
  onCancel(): void;
  imageLoader: ImageLoader;
  electronLoader: ElectronLoader;
}) => {
  const username: string = props.electronLoader.getData('username');
  const [numberOfPlayers, setNumberOfPlayers] = React.useState<number>(2);
  const [checkedGameMode, setcheckedGameMode] = React.useState<GameMode | undefined>(GameMode.Pve);
  const [characterExtensions, setCharacterExtensions] = React.useState<GameCharacterExtensions[]>(
    Sanguosha.getGameCharacterExtensions(),
  );
  const [playerSelectionDisabled, disablePlayerSelection] = React.useState<boolean>(false);
  const [playerSelectionSwitch, switchPlayerSelection] = React.useState<boolean>(true);
  const [passcode, setPasscode] = React.useState<string>();
  const [roomName, setRoomName] = React.useState<string>(
    username ? props.translator.tr(TranslationPack.translationJsonPatcher("{0}'s room", username).extract()) : '',
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    props.onSubmit({ numberOfPlayers, roomName, gameMode: checkedGameMode!, passcode, characterExtensions });
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
    if (playerSelectionSwitch) {
      options.push({ content: TranslationPack.translationJsonPatcher('one player').extract(), value: 2 });
      options.push({ content: TranslationPack.translationJsonPatcher('two players').extract(), value: 3 });
    } else {
      for (let i = 2; i <= 8; i++) {
        options.push({ content: TranslationPack.translationJsonPatcher('{0} players', i).extract(), value: i });
      }
    }
    return options;
  };

  const onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  const onGameModeChecked = (checkedIds: GameMode[]) => {
    if (checkedIds.length === 0) {
      setcheckedGameMode(undefined);
    } else {
      setcheckedGameMode(checkedIds[0]);
    }

    if (checkedIds[0] === GameMode.Standard) {
      setNumberOfPlayers(2);
    }
    if (checkedIds[0] === GameMode.OneVersusTwo || checkedIds[0] === GameMode.TwoVersusTwo) {
      disablePlayerSelection(true);
      if (checkedIds[0] === GameMode.OneVersusTwo) {
        setNumberOfPlayers(3);
      } else {
        setNumberOfPlayers(4);
      }
    } else {
      disablePlayerSelection(false);
    }
    if (checkedIds[0] === GameMode.Pve) {
      switchPlayerSelection(true);
      setNumberOfPlayers(1);
    } else {
      switchPlayerSelection(false);
    }
  };

  const onCharacterExtensionsChecked = (checkedIds: GameCharacterExtensions[]) => {
    if (checkedIds.length === 0) {
      setCharacterExtensions([]);
    } else {
      setCharacterExtensions(checkedIds);
    }
  };

  return (
    <Dialog className={styles.createRoomDialog} onClose={props.onCancel}>
      <img src={props.imageLoader.getDialogBackgroundImage().src} alt="bg" className={styles.background} />
      <form onSubmit={onSubmit} className={styles.createRoomForm} onMouseDown={onAction}>
        <div className={styles.layout}>
          <div className={classNames(styles.verticalLayout, styles.basicInfo)}>
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
              <select
                className={styles.input}
                value={numberOfPlayers}
                onChange={onNumberOfPlayersChange}
                disabled={playerSelectionDisabled}
              >
                {getPlayerOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {props.translator.tr(option.content)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.verticalLayout}>
            <div className={styles.inputField}>
              <span className={styles.inputLabelText}>{props.translator.tr('please select a game mode')}</span>
              <CheckBoxGroup
                options={getGameModeOptions(props.translator)}
                excludeSelection={true}
                onChecked={onGameModeChecked}
              />
            </div>
            <div className={styles.inputField}>
              <span className={styles.inputLabelText}>{props.translator.tr('please select character extensions')}</span>
              <CheckBoxGroup
                options={getGameCharacterExtensions(props.translator)}
                onChecked={onCharacterExtensionsChecked}
              />
            </div>
          </div>
        </div>
        <div className={styles.submitSection}>
          <Button
            variant="primary"
            type="submit"
            disabled={checkedGameMode === undefined || characterExtensions.length === 0}
          >
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
