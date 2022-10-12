import classNames from 'classnames';
import { Character, CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CharacterCard } from 'ui/character/character';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './character_selector_dialog.module.css';
import { BaseDialog } from '../base_dialog';

type CharacterSelectorDialogProps = {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  characterIds: CharacterId[];
  selectedCharacters?: CharacterId[];
  onClick?(character: Character): void;
};

@mobxReact.observer
export class CharacterSelectorDialog extends React.Component<CharacterSelectorDialogProps> {
  @mobx.observable.ref
  private tooltipCharacter: Character | undefined;
  @mobx.observable.shallow
  private selectedCharacters: CharacterId[] = [];

  private readonly onOpenTooltip = (character: Character) =>
    mobx.action(() => {
      this.tooltipCharacter = character;
    });
  private readonly onCloseTooltip = () =>
    mobx.action(() => {
      this.tooltipCharacter = undefined;
    });

  private readonly createTooltipContent = (character: Character, getRelatedSkills?: boolean) => {
    const { translator } = this.props;
    const skills = character.Skills.filter(
      skill => !skill.isShadowSkill() && !(getRelatedSkills && skill.RelatedSkills.length === 0),
    );

    return getRelatedSkills
      ? skills
          .reduce<Skill[]>((relatedSkills, skill) => {
            skill.RelatedSkills.length > 0 &&
              relatedSkills.push(...skill.RelatedSkills.map(skillName => Sanguosha.getSkillBySkillName(skillName)));
            return relatedSkills;
          }, [])
          .map((skill, index) => (
            <div className={styles.skillInfo} key={index}>
              {index === 0 && (
                <span className={styles.relatedSkillTiltle}>{this.props.translator.trx('related skill')}</span>
              )}
              <div className={styles.skillItem}>
                <span className={classNames(styles.skillName, styles.relatedSkill)}>{translator.tr(skill.Name)}</span>
                <span
                  className={styles.skillDescription}
                  dangerouslySetInnerHTML={{ __html: translator.tr(skill.Description) }}
                />
              </div>
            </div>
          ))
      : skills.map((skill, index) => (
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

  @mobx.action
  private readonly onClick = (character: Character) => {
    this.props.onClick && this.props.onClick(character);
    const index = this.selectedCharacters.findIndex(characterId => characterId === character.Id);
    if (index >= 0) {
      this.selectedCharacters.splice(index, 1);
    } else {
      this.selectedCharacters.push(character.Id);
    }
  };

  render() {
    return (
      <BaseDialog title={this.props.translator.tr('please choose a character')}>
        <div className={styles.innerDialog}>
          <div className={styles.characterSelector}>
            {this.props.characterIds.map((characterId, index) => {
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
                    onClick={this.onClick}
                    size={'small'}
                    selected={this.selectedCharacters.includes(characterId)}
                  />
                </div>
              );
            })}
          </div>
          {this.tooltipCharacter && (
            <Tooltip position={['center']} className={styles.tooltip}>
              {this.createTooltipContent(this.tooltipCharacter)}
              {this.createTooltipContent(this.tooltipCharacter, true)}
            </Tooltip>
          )}
        </div>
      </BaseDialog>
    );
  }
}
