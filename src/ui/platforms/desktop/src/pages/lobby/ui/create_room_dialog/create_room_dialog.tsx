import classNames from 'classnames';
import { Sanguosha } from 'core/game/engine';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronData } from 'electron_loader/electron_data';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { Dialog } from 'ui/dialog/dialog';
import { Picture } from 'ui/picture/picture';
import styles from './create_room_dialog.module.css';
import { Messages } from './messages';

@observer
export class CreateRoomDialog extends React.Component<{
  playerName: string;
  translator: ClientTranslationModule;
  onSubmit(data: TemporaryRoomCreationInfo, roomName: string, passcode?: string): void;
  onCancel(): void;
  imageLoader: ImageLoader;
  electronLoader: ElectronLoader;
}> {
  private username: string = this.props.electronLoader.getData(ElectronData.PlayerName);
  @mobx.observable.ref
  private numberOfPlayers = 2;
  @mobx.observable.ref
  private passcode = '';
  @mobx.observable.ref
  private roomName = this.username
    ? this.props.translator.tr(TranslationPack.translationJsonPatcher("{0}'s room", this.username).extract())
    : '';

  @mobx.observable.deep
  private gameModeOptions = [
    {
      label: this.props.translator.tr(Messages.multi()),
      id: GameMode.Standard,
      checked: false,
    },
    {
      label: this.props.translator.tr(Messages.campaign()),
      id: GameMode.Pve,
      checked: true,
    },
  ];

  private readonly onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const gameMode = this.gameModeOptions.find(o => o.checked)?.id!;
    this.props.onSubmit(
      {
        hostPlayerId: this.props.electronLoader.getTemporaryData(ElectronData.PlayerId)!,
        numberOfPlayers: gameMode === GameMode.Pve ? this.numberOfPlayers : 8,
        roomName: this.roomName,
        gameMode:
          gameMode === GameMode.Pve
            ? gameMode
            : this.props.electronLoader.getData(ElectronData.RoomSettingsGameMode) || gameMode,
        passcode: this.passcode,
        characterExtensions:
          this.props.electronLoader.getData(ElectronData.RoomSettingsCharacterExtensions) ||
          Sanguosha.getGameCharacterExtensions(),
        campaignMode: gameMode === GameMode.Pve,
        coreVersion: Sanguosha.Version,
        cardExtensions:
          this.props.electronLoader.getData(ElectronData.RoomSettingsCardExtensions) ||
          Sanguosha.getCardExtensionsFromGameMode(gameMode),
        allowObserver: this.props.electronLoader.getData(ElectronData.RoomSettingsAllowObserver) || false,
        playingTimeLimit: this.props.electronLoader.getData(ElectronData.RoomSettingsPlayTime) || 60,
        wuxiekejiTimeLimit: this.props.electronLoader.getData(ElectronData.RoomSettingsWuxiekejiTime) || 15,
        excludedCharacters: this.props.electronLoader.getData(ElectronData.RoomSettingsDisabledCharacters) || [],
      },
      this.roomName,
      this.passcode,
    );
  };

  @mobx.action
  onRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.roomName = event.target.value;
  };
  @mobx.action
  onPasscodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.passcode = event.target.value;
  };

  @mobx.action
  onNumberOfPlayersChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.numberOfPlayers = parseInt(event.target.value, 10);
  };

  @mobx.action
  private readonly onGameModeChecked = (gameModes: GameMode[]) => {
    for (const option of this.gameModeOptions) {
      if (gameModes.find(mode => mode === option.id)) {
        option.checked = true;
      } else {
        option.checked = false;
      }
    }
  };

  private readonly selectPlayerOptions = [
    { content: 'one player', value: 2 },
    { content: 'pve classic one players', value: 4 },
  ];

  private readonly onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  render() {
    const { props } = this;

    return (
      <Dialog className={styles.createRoomDialog} onClose={props.onCancel}>
        <Picture image={props.imageLoader.getDialogBackgroundImage()} className={styles.background} />
        <form onSubmit={this.onSubmit} className={styles.createRoomForm} onMouseDown={this.onAction}>
          <div className={styles.layout}>
            <div className={classNames(styles.verticalLayout, styles.basicInfo)}>
              <div className={styles.inputField}>
                <span className={styles.inputLabelText}>{props.translator.tr(Messages.enterRoomName())}</span>
                <input className={styles.input} value={this.roomName} onChange={this.onRoomNameChange} />
              </div>
              <div className={styles.inputField}>
                <span className={styles.inputLabelText}>{props.translator.tr(Messages.enterRoomPassword())}</span>
                <input className={styles.input} value={this.passcode} onChange={this.onPasscodeChange} />
              </div>
              <div className={styles.inputField}>
                <span className={styles.inputLabelText}>{props.translator.tr(Messages.enterPlayersNumber())}</span>
                <select
                  className={styles.input}
                  value={this.numberOfPlayers}
                  onChange={this.onNumberOfPlayersChange}
                  disabled={this.gameModeOptions.find(o => o.checked)?.id !== GameMode.Pve}
                >
                  {this.selectPlayerOptions.map(option => (
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
                  head={props.translator.tr(Messages.selectGameMode())}
                  options={this.gameModeOptions}
                  onChecked={this.onGameModeChecked}
                  excludeSelection={true}
                />
              </div>
            </div>
          </div>
          <div className={styles.submitSection}>
            <Button variant="primary" type="submit">
              {props.translator.tr(Messages.confirm())}
            </Button>
            <Button variant="primary" type="button" onClick={props.onCancel}>
              {props.translator.tr(Messages.cancel())}
            </Button>
          </div>
        </form>
      </Dialog>
    );
  }
}
