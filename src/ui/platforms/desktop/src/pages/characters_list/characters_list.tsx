import { AudioLoader } from 'audio_loader/audio_loader';
import { CharacterNationality } from 'core/characters/character';
import type { CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { GameCharacterExtensions } from 'core/game/game_props';
import { CharacterLoader } from 'core/game/package_loader/loader.characters';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { PagePropsWithConfig } from 'types/page_props';
import { installAudioPlayerService } from 'ui/audio/install';
import { Button } from 'ui/button/button';
import { CharacterCard } from 'ui/character/character';
import { CharacterSkinCard, CharacterSpec } from 'ui/character/characterSkin';
import { CheckBoxGroup } from 'ui/check_box/check_box_group';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './characters_list.module.css';
import { CharacterSkinInfo } from '../../image_loader/skins';

export type CharactersListProps = PagePropsWithConfig<{
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  audioLoader: AudioLoader;
  electronLoader: ElectronLoader;
  skinData: CharacterSkinInfo[];
}>;

@mobxReact.observer
export class CharactersList extends React.Component<CharactersListProps> {
  private backgroundImage = this.props.imageLoader.getLobbyBackgroundImage().src!;
  private roomListBackgroundImage = this.props.imageLoader.getRoomListBackgroundImage().src!;
  private audioService = installAudioPlayerService(this.props.audioLoader, this.props.electronLoader);

  @mobx.observable.ref
  private focusedCharacterId: CharacterId;
  @mobx.observable.ref
  private focusedSkinName: string;

  private readonly backToLobby = () => {
    this.props.history.push('/lobby');
  };

  @mobx.observable.shallow
  private checkedExtensions: GameCharacterExtensions[] = Sanguosha.getGameCharacterExtensions();
  @mobx.observable.shallow
  private selectedNationalities: CharacterNationality[] = Sanguosha.getNationalitiesList();

  @mobx.action
  private readonly onCheckExtension = (exts: GameCharacterExtensions[]) => {
    this.checkedExtensions = exts;
  };

  @mobx.action
  private readonly onCheckNationality = (nationalities: CharacterNationality[]) => {
    this.selectedNationalities = nationalities;
  };

  @mobx.computed
  private get Characters() {
    return CharacterLoader.getInstance()
      .getPackages(...this.checkedExtensions)
      .filter(character => this.selectedNationalities.includes(character.Nationality));
  }

  @mobx.action
  private readonly onHoverCharacter = (characterId: CharacterId) => () => {
    this.focusedCharacterId = characterId;
    this.focusedSkinName = Sanguosha.getCharacterById(this.focusedCharacterId).Name;
  };
  @mobx.action
  private readonly onfocusedSkinName = (skinName: string) => {
    this.focusedSkinName = skinName;
  };
  render() {
    return (
      <div className={styles.charactersList}>
        <img src={this.backgroundImage} alt="" className={styles.background} />
        <div className={styles.board}>
          <div className={styles.functionBoard}>
            <Button variant="primary" className={styles.button} onClick={this.backToLobby}>
              {this.props.translator.tr('back to lobby')}
            </Button>
          </div>
          <div className={styles.innerList}>
            <img src={this.roomListBackgroundImage} alt="" className={styles.roomListBackground} />
            <div className={styles.checkboxGroups}>
              <CheckBoxGroup
                className={styles.packagesGroup}
                options={Sanguosha.getGameCharacterExtensions().map(ext => ({
                  label: this.props.translator.tr(ext),
                  checked: true,
                  id: ext,
                }))}
                onChecked={this.onCheckExtension}
                itemsPerLine={6}
              />
              <CheckBoxGroup
                className={styles.nationalitiesGroup}
                options={Sanguosha.getNationalitiesList().map(nationality => ({
                  label: this.props.translator.tr(Functional.getPlayerNationalityText(nationality)),
                  checked: true,
                  id: nationality,
                }))}
                onChecked={this.onCheckNationality}
                itemsPerLine={6}
              />
            </div>
            <div className={styles.characters}>
              {this.Characters.map(character => (
                <CharacterCard
                  key={character.Id}
                  character={character}
                  imageLoader={this.props.imageLoader}
                  translator={this.props.translator}
                  className={styles.character}
                  onClick={this.onHoverCharacter(character.Id)}
                  size="small"
                />
              ))}
            </div>
            {this.focusedCharacterId !== undefined && (
              <Tooltip position={['slightTop']} className={styles.characterTooltip}>
                <CharacterSkinCard
                  className={styles.specCharacter}
                  character={Sanguosha.getCharacterById(this.focusedCharacterId)}
                  onClick={this.onfocusedSkinName}
                  skinData={this.props.skinData}
                  imageLoader={this.props.imageLoader}
                  translator={this.props.translator}
                />
                <CharacterSpec
                  character={Sanguosha.getCharacterById(this.focusedCharacterId)}
                  audioService={this.audioService}
                  skinData={this.props.skinData}
                  skinName={
                    this.focusedSkinName
                      ? this.focusedSkinName
                      : Sanguosha.getCharacterById(this.focusedCharacterId).Name
                  }
                  translator={this.props.translator}
                />
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  }
}
