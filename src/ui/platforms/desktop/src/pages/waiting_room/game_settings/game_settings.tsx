import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions, WaitingRoomGameSettings } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { WuXieKeJiSkill } from 'core/skills';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
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
  className?: string;
  onSave(): void;
};

@mobxReact.observer
export class GameSettings extends React.Component<GameSettingsProps> {
  private translationMessage = createTranslationMessages(this.props.translator);

  @mobx.computed
  private get pvePlayersOptions() {
    return [
      {
        label: this.translationMessage.pveDragon(),
        id: 3,
        checked: this.props.store.gameSettings.pveNumberOfPlayers === 3,
        disabled: !this.props.controlable,
      },
      {
        label: this.translationMessage.pveClassic(),
        id: 5,
        checked: this.props.store.gameSettings.pveNumberOfPlayers === 5,
        disabled: !this.props.controlable,
      },
    ];
  }

  @mobx.computed
  private get getGameModeOptions() {
    return [
      {
        label: this.props.translator.tr(GameMode.Standard),
        id: GameMode.Standard,
        checked: this.props.store.gameSettings.gameMode === GameMode.Standard,
        disabled: !this.props.controlable,
      },
      {
        label: this.props.translator.tr(GameMode.OneVersusTwo),
        id: GameMode.OneVersusTwo,
        checked: this.props.store.gameSettings.gameMode === GameMode.OneVersusTwo,
        disabled: !this.props.controlable,
      },
      {
        label: this.props.translator.tr(GameMode.TwoVersusTwo),
        id: GameMode.TwoVersusTwo,
        checked: this.props.store.gameSettings.gameMode === GameMode.TwoVersusTwo,
        disabled: !this.props.controlable,
      },
      {
        label: this.props.translator.tr(GameMode.Pve),
        id: GameMode.Pve,
        checked: this.props.store.gameSettings.gameMode === GameMode.Pve,
        disabled: !this.props.controlable,
      },
      {
        label: this.props.translator.tr(GameMode.Hegemony),
        id: GameMode.Hegemony,
        checked: this.props.store.gameSettings.gameMode === GameMode.Hegemony,
        disabled: true,
      },
    ];
  }

  @mobx.computed
  private get gameCharacterExtensions() {
    return Sanguosha.getGameCharacterExtensions().map(extension => ({
      id: extension,
      label: this.props.translator.tr(extension),
      checked: this.props.store.gameSettings.characterExtensions.includes(extension),
      disabled: extension === GameCharacterExtensions.Standard || !this.props.controlable,
    }));
  }

  private onChangeGameSettings<T>(property: keyof WaitingRoomGameSettings) {
    return (value: T) => {
      this.props.presenter.updateGameSettings(this.props.store, {
        ...this.props.store.gameSettings,
        [property]: value,
      });
      this.props.onSave();
    };
  }

  private readonly onCheckedGameMode = (checkedIds: GameMode[]) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      gameMode: checkedIds[0],
    });
    this.props.onSave();
  };

  @mobx.action
  private readonly onCheckedPveSpecifiedGameMode = (playerNumbers: number[]) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      pveNumberOfPlayers: playerNumbers[0],
    });
    this.props.onSave();
  };

  render() {
    return (
      <div className={classNames(styles.container, this.props.className)}>
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.gameMode()}
            options={this.getGameModeOptions}
            onChecked={this.onCheckedGameMode}
            excludeSelection={true}
          />
        </div>
        {this.props.store.gameSettings.gameMode === GameMode.Pve && (
          <div className={styles.settingsLabel}>
            <CheckBoxGroup
              head={this.translationMessage.pveModeSelection()}
              options={this.pvePlayersOptions}
              onChecked={this.onCheckedPveSpecifiedGameMode}
              excludeSelection={true}
            />
          </div>
        )}
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.characterPackageSettings()}
            options={this.gameCharacterExtensions}
            onChecked={this.onChangeGameSettings('characterExtensions')}
            excludeSelection={false}
          />
        </div>
        <div className={styles.settingsLabel}>
          <CheckBox
            id="enableObserver"
            checked={this.props.store.gameSettings.allowObserver || false}
            disabled={!this.props.controlable}
            onChecked={this.onChangeGameSettings('allowObserver')}
            label={this.translationMessage.enableObserver()}
          />
          <div className={styles.inputLabel}>
            <span className={styles.inputTitle}>{this.translationMessage.passcode()}</span>
            <Input
              value={this.props.store.gameSettings.passcode}
              onChange={this.onChangeGameSettings('passcode')}
              disabled={!this.props.controlable}
              transparency={0.3}
              min={5}
              max={60}
            />
          </div>
          <div className={styles.inputLabel}>
            <span className={styles.inputTitle}>{this.translationMessage.getTimeLimit('play stage')}</span>
            <Input
              type="number"
              value={this.props.store.gameSettings.playingTimeLimit?.toString()}
              onChange={this.onChangeGameSettings('playingTimeLimit')}
              disabled={!this.props.controlable}
              transparency={0.3}
              min={15}
              max={300}
              suffix={this.translationMessage.second()}
            />
          </div>
          <div className={styles.inputLabel}>
            <span className={styles.inputTitle}>{this.translationMessage.getTimeLimit(WuXieKeJiSkill.Name)}</span>
            <Input
              type="number"
              value={this.props.store.gameSettings.wuxiekejiTimeLimit?.toString()}
              onChange={this.onChangeGameSettings('wuxiekejiTimeLimit')}
              disabled={!this.props.controlable}
              transparency={0.3}
              min={5}
              max={60}
              suffix={this.translationMessage.second()}
            />
          </div>
        </div>
      </div>
    );
  }
}
