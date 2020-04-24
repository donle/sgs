import { Character, CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { CharacterCard } from 'pages/room/ui/character/character';
import * as React from 'react';
import { BaseDialog } from '../base_dialog';
import styles from './character_selector_dialog.module.css';

type CharacterSelectorDialogProps = {
  translator: ClientTranslationModule;
  characterIds: CharacterId[];
  onClick?(character: Character): void;
};

export const CharacterSelectorDialog = (props: CharacterSelectorDialogProps) => {
  const { translator, onClick, characterIds } = props;
  const characters = characterIds.map((characterId) => {
    const character = Sanguosha.getCharacterById(characterId);

    return (
      <CharacterCard
        translator={translator}
        character={character}
        key={characterId}
        onClick={onClick}
        className={styles.characterSelectorItem}
      />
    );
  });

  return (
    <BaseDialog title={translator.tr('please choose a character')}>
      <div className={styles.characterSelector}>{characters}</div>
    </BaseDialog>
  );
};
