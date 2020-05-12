import { Character, CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { CharacterCard } from 'pages/room/ui/character/character';
import * as React from 'react';
import { Tooltip } from 'ui/tooltip/tooltip';
import { BaseDialog } from '../base_dialog';
import styles from './character_selector_dialog.module.css';

type CharacterSelectorDialogProps = {
  translator: ClientTranslationModule;
  characterIds: CharacterId[];
  onClick?(character: Character): void;
};

@mobxReact.observer
export class CharacterSelectorDialog extends React.Component<CharacterSelectorDialogProps> {
  @mobx.observable.shallow
  private tooltipOpened: boolean[] = new Array<boolean>(this.props.characterIds.length).fill(false);
  private tooltipTimer: NodeJS.Timer | undefined;

  private readonly onOpenTooltip = (index: number) => () => {
    this.tooltipTimer = setTimeout(
      mobx.action(() => {
        this.tooltipOpened[index] = true;
      }),
      1500,
    );
  };
  private readonly onCloseTooltip = (index: number) =>
    mobx.action(() => {
      this.tooltipTimer && clearTimeout(this.tooltipTimer);
      this.tooltipOpened[index] = false;
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
        onMouseLeave={this.onCloseTooltip(index)}
        onMouseEnter={this.onOpenTooltip(index)}
        key={index}
      >
        <CharacterCard
          translator={this.props.translator}
          character={character}
          key={characterId}
          onClick={this.props.onClick}
        />
        {this.tooltipOpened[index] && <Tooltip position={['top']}>{this.createTooltipContent(character)}</Tooltip>}
      </div>
    );
  });

  render() {
    return (
      <BaseDialog title={this.props.translator.tr('please choose a character')}>
        <div className={styles.characterSelector}>{this.characters}</div>
      </BaseDialog>
    );
  }
}
