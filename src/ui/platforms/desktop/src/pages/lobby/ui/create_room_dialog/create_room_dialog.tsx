import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronData } from 'electron_loader/electron_data';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { Dialog } from 'ui/dialog/dialog';
import { Picture } from 'ui/picture/picture';
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

export const CreateRoomDialog = (props: {
  playerName: string;
  translator: ClientTranslationModule;
  onSubmit(data: TemporaryRoomCreationInfo, roomName: string, passcode?: string): void;
  onCancel(): void;
  imageLoader: ImageLoader;
  electronLoader: ElectronLoader;
}) => {
  const username: string = props.electronLoader.getData(ElectronData.PlayerName);
  const [globalDisabled, disableAllSettings] = React.useState<boolean>(true);
  const [numberOfPlayers, setNumberOfPlayers] = React.useState<number>(2);
  const [checkedGameMode, setcheckedGameMode] = React.useState<GameMode>(GameMode.Pve);
  const [characterExtensions, setCharacterExtensions] = React.useState<GameCharacterExtensions[]>(
    Sanguosha.getGameCharacterExtensions(),
  );
  const [playerSelectionDisabled, disablePlayerSelection] = React.useState<boolean>(false);
  const [pvePlayerSelection, switchToPvePlayerSelection] = React.useState<boolean>(true);
  const [passcode, setPasscode] = React.useState<string>();
  const [roomName, setRoomName] = React.useState<string>(
    username ? props.translator.tr(TranslationPack.translationJsonPatcher("{0}'s room", username).extract()) : '',
  );

  React.useEffect(() => {
    if (checkedGameMode === GameMode.Pve) {
      disableAllSettings(false);
    }
  }, [checkedGameMode]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    /* const isCampaignMode = checkedGameMode === GameMode.Pve && numberOfPlayers === 2; */
    props.onSubmit(
      {
        hostPlayerId: props.electronLoader.getTemporaryData(ElectronData.PlayerId)!,
        numberOfPlayers,
        roomName,
        gameMode: checkedGameMode!,
        passcode,
        characterExtensions,
        campaignMode: false,
        coreVersion: Sanguosha.Version,
        cardExtensions: Sanguosha.getCardExtensionsFromGameMode(checkedGameMode),
      },
      roomName,
      passcode,
    );
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
    if (pvePlayerSelection) {
      options.push({ content: TranslationPack.translationJsonPatcher('one player').extract(), value: 2 });
      options.push({ content: TranslationPack.translationJsonPatcher('two players').extract(), value: 3 });
      options.push({ content: TranslationPack.translationJsonPatcher('pve classic one players').extract(), value: 4 });
      options.push({ content: TranslationPack.translationJsonPatcher('pve classic two players').extract(), value: 5 });
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
      setcheckedGameMode(GameMode.Pve);
    } else {
      setcheckedGameMode(checkedIds[0]);
    }
    switchToPvePlayerSelection(checkedIds[0] === GameMode.Pve);
    disablePlayerSelection(checkedIds[0] === GameMode.OneVersusTwo || checkedIds[0] === GameMode.TwoVersusTwo);

    if (checkedIds[0] === GameMode.Standard) {
      setNumberOfPlayers(2);
    } else if (checkedIds[0] === GameMode.OneVersusTwo) {
      setNumberOfPlayers(3);
    } else if (checkedIds[0] === GameMode.TwoVersusTwo) {
      setNumberOfPlayers(4);
    } else if (checkedIds[0] === GameMode.Pve) {
      setNumberOfPlayers(2);
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
      <Picture image={props.imageLoader.getDialogBackgroundImage()} className={styles.background} />
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
                disabled={playerSelectionDisabled || globalDisabled}
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
              <CheckBoxGroup
                head={props.translator.tr('please select a game mode')}
                options={getGameModeOptions(props.translator)}
                excludeSelection={true}
                onChecked={onGameModeChecked}
              />
            </div>
            <div className={styles.inputField}>
              <CheckBoxGroup
                head={props.translator.tr('please select character extensions')}
                options={getGameCharacterExtensions(props.translator)}
                onChecked={onCharacterExtensionsChecked}
                disabled={globalDisabled}
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
