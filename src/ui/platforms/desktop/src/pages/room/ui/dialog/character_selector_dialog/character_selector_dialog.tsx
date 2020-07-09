import { Character, CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CharacterCard } from 'ui/character/character';
import { Tooltip } from 'ui/tooltip/tooltip';
import { BaseDialog } from '../base_dialog';
import styles from './character_selector_dialog.module.css';

type CharacterSelectorDialogProps = {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  characterIds: CharacterId[];
  onClick?(character: Character): void;
};

@mobxReact.observer
export class CharacterSelectorDialog extends React.Component<CharacterSelectorDialogProps> {
  @mobx.observable.ref
  private tooltipCharacter: Character | undefined;

  private readonly onOpenTooltip = (character: Character) =>
    mobx.action(() => {
      this.tooltipCharacter = character;
    });
  private readonly onCloseTooltip = () =>
    mobx.action(() => {
      this.tooltipCharacter = undefined;
    });

  private readonly createTooltipContent = (character: Character) => {
    const { translator } = this.props;
    const skills = character.Skills.filter(skill => !skill.isShadowSkill());
    return skills.map((skill, index) => (
      <div className={styles.skillInfo} key={index}>
        <div className={styles.skillItem}>
          <span className={styles.skillName}>{translator.tr(skill.Name)}</span>
          <span
            className={styles.skillDescription}
            dangerouslySetInnerHTML={{ __html: translator.tr(skill.Description) }}
          />
        </div>
      </div>
    ));
  };
  private readonly characters = this.props.characterIds.map((characterId, index) => {
    const character = Sanguosha.getCharacterById(characterId);
    return (
      <div
        className={styles.characterSelectorItem}
        onMouseLeave={this.onCloseTooltip()}
        onMouseEnter={this.onOpenTooltip(character)}
        key={index}
      >
        <CharacterCard
          imageLoader={this.props.imageLoader}
          translator={this.props.translator}
          character={character}
          key={characterId}
          onClick={this.props.onClick}
        />
      </div>
    );
  });

  render() {
    return (
      <BaseDialog title={this.props.translator.tr('please choose a character')}>
        <div className={styles.innerDialog}>
          <div className={styles.characterSelector}>{this.characters}</div>
          {this.tooltipCharacter && (
            <Tooltip position={['top']} className={styles.tooltip}>
              {this.createTooltipContent(this.tooltipCharacter)}
            </Tooltip>
          )}
        </div>
      </BaseDialog>
    );
  }
}
