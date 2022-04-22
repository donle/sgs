import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { WuXieKeJiSkill } from 'core/skills';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CheckBox } from 'ui/check_box/check_box';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { Input } from 'ui/input/input';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomStore } from '../waiting_room.store';
import styles from './game_settings.module.css';
import { createTranslationMessages } from './messages';

export type GameSettingsProps = {
  controlable: boolean;
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
};

@mobxReact.observer
export class GameSettings extends React.Component<GameSettingsProps> {
  private translationMessage = createTranslationMessages(this.props.translator);

  private getGameModeOptions(translator: ClientTranslationModule, controlable: boolean) {
    return [
      {
        label: translator.tr(GameMode.Standard),
        id: GameMode.Standard,
        checked: false,
        disabled: !controlable,
      },
      {
        label: translator.tr(GameMode.OneVersusTwo),
        id: GameMode.OneVersusTwo,
        checked: false,
        disabled: !controlable,
      },
      {
        label: translator.tr(GameMode.TwoVersusTwo),
        id: GameMode.TwoVersusTwo,
        checked: false,
        disabled: !controlable,
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
        disabled: true,
      },
    ];
  }

  private getGameCharacterExtensions(translator: ClientTranslationModule, controlable: boolean) {
    return Sanguosha.getGameCharacterExtensions().map(extension => ({
      id: extension,
      label: translator.tr(extension),
      checked: true,
      disabled: extension === GameCharacterExtensions.Standard || !controlable,
    }));
  }

  private readonly onCheckedGameMode = (checkedIds: GameMode[]) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      gameMode: checkedIds[0],
    });
  };
  private readonly onCheckedCharacterPackages = (characterPackages: GameCharacterExtensions[]) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      characterExtensions: characterPackages,
    });
  };

  private readonly onCheckObserverEnabled = (checked: boolean) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      allowObserver: checked,
    });
  };

  private readonly onChangePlayTimeLimit = (timeLimitString: string) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      playingTimeLimit: parseInt(timeLimitString, 10),
    });
  };

  private readonly onChangeWuXieKeJiTimeLimit = (timeLimitString: string) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      wuxiekejiTimeLimit: parseInt(timeLimitString, 10),
    });
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.gameMode()}
            options={this.getGameModeOptions(this.props.translator, this.props.controlable)}
            onChecked={this.onCheckedGameMode}
            excludeSelection={true}
          />
        </div>
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.characterPackageSettings()}
            options={this.getGameCharacterExtensions(this.props.translator, this.props.controlable)}
            onChecked={this.onCheckedCharacterPackages}
            excludeSelection={false}
          />
        </div>
        <div className={styles.settingsLabel}>
          <CheckBox
            id="enableObserver"
            checked={this.props.store.gameSettings.allowObserver || false}
            disabled={!this.props.controlable}
            onChecked={this.onCheckObserverEnabled}
            label={this.translationMessage.enableObserver()}
          />
          <div className={styles.inputLabel}>
            <span className={styles.inputTitle}>{this.translationMessage.getTimeLimit('play phase')}</span>
            <Input
              type="number"
              value={this.props.store.gameSettings.playingTimeLimit?.toString()}
              onChange={this.onChangePlayTimeLimit}
              disabled={!this.props.controlable}
              min={15}
              max={300}
            />
          </div>
          <div className={styles.inputLabel}>
            <span className={styles.inputTitle}>{this.translationMessage.getTimeLimit(WuXieKeJiSkill.Name)}</span>
            <Input
              type="number"
              value={this.props.store.gameSettings.wuxiekejiTimeLimit?.toString()}
              onChange={this.onChangeWuXieKeJiTimeLimit}
              disabled={!this.props.controlable}
              min={5}
              max={60}
            />
          </div>
        </div>
      </div>
    );
  }
}
