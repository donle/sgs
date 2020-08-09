import React, { useMemo } from 'react';
import { CharacterId, CharacterNationality } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { getImageLoader } from 'image_loader/image_loader_util';
import { PagePropsWithConfig } from 'types/page_props';
import classNames from 'classnames';
import { CharacterCard } from 'ui/character/character';
import { Background } from '../room/ui/background/background';
import styles from './characters.module.css';

type CharacterProps = PagePropsWithConfig<{
    translator: ClientTranslationModule;
  }>;

export const Characters = (props: CharacterProps) => {
  const { config, translator } = props;
  const imageLoader = getImageLoader(config.flavor);

  const characters = useMemo(() => {
    return Sanguosha.getAllCharacters().map((character, cardId) => 
      <CharacterCard
        key={cardId}
        className={classNames(styles.character, {
          [styles.wei]: character.Nationality === CharacterNationality.Wei,
          [styles.shu]: character.Nationality === CharacterNationality.Shu,
          [styles.wu]: character.Nationality === CharacterNationality.Wu,
          [styles.qun]: character.Nationality === CharacterNationality.Qun,
          [styles.god]: character.Nationality === CharacterNationality.God,
        })}
        character={Sanguosha.getCharacterById(cardId as CharacterId)}
        imageLoader={imageLoader}
        translator={translator}
        size="regular"
        hideHp
      />
    );
  }, [imageLoader, translator])

  return (<>
    <Background imageLoader={imageLoader} />
    <main className={styles.content}>
      <section className={styles.container}>
        {characters}
      </section>
    </main>
  </>)
};

export default Characters;
