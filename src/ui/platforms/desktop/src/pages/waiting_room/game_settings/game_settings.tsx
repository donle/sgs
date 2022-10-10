import classNames from 'classnames';
import { Character } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions, WaitingRoomGameSettings } from 'core/game/game_props';
import { GameMode } from 'core/shares/types/room_props';
import { WuXieKeJiSkill } from 'core/skills';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CharacterCard } from 'ui/character/character';
import { CheckBox } from 'ui/check_box/check_box';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { Input } from 'ui/input/input';
import { Spacing } from 'ui/layout/spacing';
import { Text } from 'ui/text/text';
import { Tooltip } from 'ui/tooltip/tooltip';
import { WaitingRoomPresenter } from '../waiting_room.presenter';
import { WaitingRoomStore } from '../waiting_room.store';
import styles from './game_settings.module.css';
import { createTranslationMessages } from './messages';

export type GameSettingsProps = {
  controlable: boolean;
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  presenter: WaitingRoomPresenter;
  store: WaitingRoomStore;
  className?: string;
  campaignSettings?: boolean;
  onSave(): void;
};

@mobxReact.observer
export class GameSettings extends React.Component<GameSettingsProps> {
  private translationMessage = createTranslationMessages(this.props.translator);
  private inputDebounceTimer: NodeJS.Timer | undefined;
  private passwordInputDebounceTimer: NodeJS.Timer | undefined;
  private searchContentElementRef = React.createRef<HTMLDivElement>();

  @mobx.observable.ref
  private searchCharacterInput: string = '';
  @mobx.observable.ref
  private searchTooltipPosition: [number, number] | undefined;

  @mobx.observable.shallow
  private searchResultList: Character[] = [];

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

  private readonly onChangePassword = (password: string) => {
    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      passcode: password || '',
    });

    this.passwordInputDebounceTimer = setTimeout(() => {
      this.props.onSave();

      this.passwordInputDebounceTimer = undefined;
    }, 1000);
  };

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

  @mobx.action
  private readonly onSearchCharacterInputChange = (value?: string) => {
    this.searchCharacterInput = value ?? '';

    if (this.inputDebounceTimer) {
      clearTimeout(this.inputDebounceTimer);
    }

    this.inputDebounceTimer = setTimeout(
      mobx.action(() => {
        if (!this.searchCharacterInput) {
          this.searchResultList = [];
          this.inputDebounceTimer = undefined;
          return;
        }

        this.searchResultList = Sanguosha.getCharacterByExtensions(
          this.props.store.gameSettings.characterExtensions,
        ).filter(
          character =>
            character.Name.includes(this.searchCharacterInput) ||
            this.props.translator.tr(character.Name).includes(this.searchCharacterInput),
        );

        if (this.searchContentElementRef.current) {
          const { left } = this.searchContentElementRef.current.getBoundingClientRect();
          this.searchTooltipPosition = [window.screen.width - left, window.screen.height / 2];
        }

        this.inputDebounceTimer = undefined;
      }),
      1000,
    );
  };

  private readonly addOrRemoveForbiddenCharactersById = (character: Character) => {
    if (!this.props.controlable) {
      return;
    }

    this.props.presenter.updateGameSettings(this.props.store, {
      ...this.props.store.gameSettings,
      excludedCharacters: this.props.store.gameSettings.excludedCharacters.includes(character.Id)
        ? this.props.store.gameSettings.excludedCharacters.filter(characterId => characterId !== character.Id)
        : [...this.props.store.gameSettings.excludedCharacters, character.Id],
    });
    this.props.onSave();

    mobx.runInAction(() => {
      this.searchCharacterInput = '';
      this.searchResultList = [];
    });
  };

  render() {
    return (
      <div className={classNames(styles.container, this.props.className)}>
        {!this.props.campaignSettings && (
          <>
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
          </>
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
            className={styles.observerCheckbox}
            checked={this.props.store.gameSettings.allowObserver || false}
            disabled={!this.props.controlable}
            onChecked={this.onChangeGameSettings('allowObserver')}
            label={this.translationMessage.enableObserver()}
          />
          <div className={styles.inputLabel}>
            <Text className={styles.inputTitle} color="white" variant="semiBold" bottomSpacing={Spacing.Spacing_8}>
              {this.translationMessage.passcode()}
            </Text>
            <Input
              value={this.props.store.gameSettings.passcode}
              onChange={this.onChangePassword}
              disabled={!this.props.controlable}
              transparency={0.3}
              min={5}
              max={60}
            />
          </div>
          <div className={classNames(styles.inputLabel, styles.horizontalInput)}>
            <div>
              <Text className={styles.inputTitle} color="white" variant="semiBold" bottomSpacing={Spacing.Spacing_8}>
                {this.translationMessage.getTimeLimit('play stage')}
              </Text>
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
            <div>
              <Text className={styles.inputTitle} color="white" variant="semiBold" bottomSpacing={Spacing.Spacing_8}>
                {this.translationMessage.getTimeLimit(WuXieKeJiSkill.Name)}
              </Text>
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
          <div>
            <Text className={styles.inputTitle} color="white" variant="semiBold" bottomSpacing={Spacing.Spacing_8}>
              {this.translationMessage.fortuneCardExchangeLimit()}
            </Text>
            <Input
              type="number"
              value={this.props.store.gameSettings.fortuneCardsExchangeLimit?.toString()}
              onChange={this.onChangeGameSettings('fortuneCardsExchangeLimit')}
              disabled={!this.props.controlable}
              transparency={0.3}
              min={0}
              max={3}
              suffix={this.translationMessage.times()}
            />
          </div>
        </div>
        <div className={styles.settingsLabel} ref={this.searchContentElementRef}>
          <Text
            className={styles.inputTitle}
            color="white"
            variant="semiBold"
            bottomSpacing={Spacing.Spacing_16}
            topSpacing={Spacing.Spacing_16}
          >
            {this.translationMessage.forbiddenCharacters()}
          </Text>
          <Input
            value={this.searchCharacterInput}
            onChange={this.onSearchCharacterInputChange}
            disabled={!this.props.controlable}
            transparency={0.3}
            placeholder={this.translationMessage.searchCharacterByName()}
          />

          {this.searchResultList.length > 0 && this.searchTooltipPosition && (
            <Tooltip
              position={{ bottom: this.searchTooltipPosition[1], right: this.searchTooltipPosition[0] }}
              className={styles.searchResultsList}
            >
              {this.searchResultList.map(character => (
                <CharacterCard
                  key={character.Id}
                  character={character}
                  size="tiny"
                  imageLoader={this.props.imageLoader}
                  translator={this.props.translator}
                  onClick={this.addOrRemoveForbiddenCharactersById}
                />
              ))}
            </Tooltip>
          )}

          <div className={styles.searchResultsList}>
            {this.props.store.gameSettings.excludedCharacters.map(characterId => (
              <CharacterCard
                key={characterId}
                character={Sanguosha.getCharacterById(characterId)}
                size="tiny"
                imageLoader={this.props.imageLoader}
                translator={this.props.translator}
                onClick={this.addOrRemoveForbiddenCharactersById}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}
