import { Character, CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
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

export const CharacterSelectorDialog = (props: CharacterSelectorDialogProps) => {
  const { translator, onClick, characterIds } = props;
  const [tooltipOpened, setTooltipStatus] = React.useState(new Array<boolean>(characterIds.length).fill(false));

  const onOpenTooltip = (index: number) => () => {
    tooltipTimer = setTimeout(() => {
      const newTooltipOpened = [...tooltipOpened];
      newTooltipOpened[index] = true;
      setTooltipStatus(newTooltipOpened);
    }, 1500);
  };
  const onCloseTooltip = (index: number) => () => {
    tooltipTimer && clearTimeout(tooltipTimer);

    const newTooltipOpened = [...tooltipOpened];
    newTooltipOpened[index] = false;
    setTooltipStatus(newTooltipOpened);
  };
  let tooltipTimer: NodeJS.Timer | undefined;

  const createTooltipContent = (character: Character) => {
    const skills = character.Skills.filter(skill => !skill.isShadowSkill());
    return skills.map(skill => (
      <div className={styles.skillInfo}>
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
  const characters = characterIds.map((characterId, index) => {
    const character = Sanguosha.getCharacterById(characterId);

    return (
      <div
        className={styles.characterSelectorItem}
        onMouseLeave={onCloseTooltip(index)}
        onMouseEnter={onOpenTooltip(index)}
      >
        <CharacterCard translator={translator} character={character} key={characterId} onClick={onClick} />
        {tooltipOpened[index] && <Tooltip position={['top']}>{createTooltipContent(character)}</Tooltip>}
      </div>
    );
  });

  return (
    <BaseDialog title={translator.tr('please choose a character')}>
      <div className={styles.characterSelector}>{characters}</div>
    </BaseDialog>
  );
};
