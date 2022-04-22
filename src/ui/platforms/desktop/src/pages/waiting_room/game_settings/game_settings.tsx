import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { WuXieKeJiSkill } from 'core/skills';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CheckBox } from 'ui/check_box/check_box';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { Input } from 'ui/input/input';
import { RoomAvatarService } from '../services/avatar_service';
import { WaitingRoomSender } from '../services/sender_service';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomStore } from '../waiting_room.store';
import styles from './game_settings.module.css';
import { createTranslationMessages } from './messages';

export type GameSettingsProps = {
  controlable: boolean;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
  avatarService: RoomAvatarService;
  senderService: WaitingRoomSender;
};

@mobxReact.observer
export class GameSettings extends React.Component<GameSettingsProps> {
  @mobx.observable.ref
  private gameMode: GameMode = GameMode.Standard;
  @mobx.observable.ref
  private playTimeLimit: number = 60;
  @mobx.observable.ref
  private wuxiekejiTimeLimit: number = 15;
  @mobx.observable.ref
  private enableObserver: boolean = false;
  @mobx.observable.ref
  private characterPackages = Sanguosha.getGameCharacterExtensions();

  private translationMessage = createTranslationMessages(this.props.translator);

  private getGameModeOptions(translator: ClientTranslationModule) {
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
        disabled: true,
      },
    ];
  }

  private getGameCharacterExtensions(translator: ClientTranslationModule) {
    return Sanguosha.getGameCharacterExtensions().map(extension => ({
      id: extension,
      label: translator.tr(extension),
      checked: true,
      disabled: extension === GameCharacterExtensions.Standard,
    }));
  }

  @mobx.action
  private readonly onCheckedGameMode = (checkedIds: GameMode[]) => {
    this.gameMode = checkedIds[0];
  };
  @mobx.action
  private readonly onCheckedCharacterPackages = (characterPackages: GameCharacterExtensions[]) => {
    this.characterPackages = characterPackages;
  };
  @mobx.action
  private readonly onCheckObserverEnabled = (checked: boolean) => {
    this.enableObserver = checked;
  };
  @mobx.action
  private readonly onChangePlayTimeLimit = (timeLimitString: string) => {
    this.playTimeLimit = parseInt(timeLimitString, 10);
  };
  @mobx.action
  private readonly onChangeWuXieKeJiTimeLimit = (ctimeLimitString: string) => {
    this.wuxiekejiTimeLimit = parseInt(ctimeLimitString, 10);
  };

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.gameMode()}
            options={this.getGameModeOptions(this.props.translator)}
            onChecked={this.onCheckedGameMode}
            excludeSelection={true}
          />
        </div>
        <div className={styles.settingsLabel}>
          <CheckBoxGroup
            head={this.translationMessage.characterPackageSettings()}
            options={this.getGameCharacterExtensions(this.props.translator)}
            onChecked={this.onCheckedCharacterPackages}
            excludeSelection={false}
          />
        </div>
        <div className={styles.settingsLabel}>
          <CheckBox
            id="enableObserver"
            checked={this.enableObserver}
            onChecked={this.onCheckObserverEnabled}
            label={this.translationMessage.enableObserver()}
          />
          <div className={styles.inputLabel}>
            <span className={styles.inputTitle}>{this.translationMessage.getTimeLimit('play phase')}</span>
            <Input
              type="number"
              value={this.playTimeLimit.toString()}
              onChange={this.onChangePlayTimeLimit}
              min={15}
              max={300}
            />
          </div>
          <div className={styles.inputLabel}>
            <span className={styles.inputTitle}>{this.translationMessage.getTimeLimit(WuXieKeJiSkill.Name)}</span>
            <Input
              type="number"
              value={this.playTimeLimit.toString()}
              onChange={this.onChangeWuXieKeJiTimeLimit}
              min={5}
              max={60}
            />
          </div>
        </div>
      </div>
    );
  }
}
