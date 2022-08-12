import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions, WaitingRoomGameSettings } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { WuXieKeJiSkill } from 'core/skills';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { CheckBox } from 'ui/check_box/check_box';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { CheckBoxGroupPresenter } from 'ui/check_box/check_box_group_presenter';
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
  @mobx.observable.ref
  private enableSave = false;

  private translationMessage = createTranslationMessages(this.props.translator);

  private checkBoxPresenter = new CheckBoxGroupPresenter();
  private gameModeCheckBoxStore = this.checkBoxPresenter.createStore([
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
      label: this.props.translator.tr(GameMode.Hegemony),
      id: GameMode.Hegemony,
      checked: this.props.store.gameSettings.gameMode === GameMode.Hegemony,
      disabled: true,
    },
  ]);

  private gameCharacterExtensionsStore = this.checkBoxPresenter.createStore(
    Sanguosha.getGameCharacterExtensions().map(extension => ({
      id: extension,
      label: this.props.translator.tr(extension),
      checked: this.props.store.gameSettings.characterExtensions.includes(extension),
      disabled: extension === GameCharacterExtensions.Standard || !this.props.controlable,
    })),
  );

  private readonly onCheckedGameMode = (checkedIds: GameMode[]) => {
    mobx.runInAction(() => {
      this.enableSave = true;
    });

    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      gameMode: checkedIds[0],
    });
  };

  private onChangeGameSettings<T>(property: keyof WaitingRoomGameSettings) {
    return (value: T) => {
      mobx.runInAction(() => {
        this.enableSave = true;
      });

      this.props.presenter.updateGameSettings(this.props.store, {
        ...this.props.store.gameSettings,
        [property]: value,
      });
    };
  }

  @mobx.action
  private readonly onSaveSettings = () => {
    this.props.onSave();
    this.enableSave = false;
  };

  render() {
    return (
      <div className={classNames(styles.container, this.props.className)}>
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.gameMode()}
            presenter={this.checkBoxPresenter}
            store={this.gameModeCheckBoxStore}
            onChecked={this.onCheckedGameMode}
            excludeSelection={true}
          />
        </div>
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.characterPackageSettings()}
            presenter={this.checkBoxPresenter}
            store={this.gameCharacterExtensionsStore}
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
          <Button
            className={styles.saveButton}
            variant="primary"
            disabled={!this.enableSave}
            onClick={this.onSaveSettings}
          >
            {this.translationMessage.save()}
          </Button>
        </div>
      </div>
    );
  }
}
