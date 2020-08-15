import classNames from 'classnames';
import { CharacterId, CharacterNationality } from 'core/characters/character';
import { Character } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { getImageLoader } from 'image_loader/image_loader_util';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { PagePropsWithConfig } from 'types/page_props';
import { CharacterCard } from 'ui/character/character';
import { Background } from '../room/ui/background/background';
import styles from './characters.module.css';
import SearchBar from './ui/search/search';

type CharacterProps = PagePropsWithConfig<{
  translator: ClientTranslationModule;
}>;

export const Characters = (props: CharacterProps) => {
  const { config, translator } = props;
  const imageLoader = getImageLoader(config.flavor);
  const totalCharacters: Character[] = useMemo(() => Sanguosha.getAllCharacters(), []);//need useMemo?

  const [characters, setCharacters] = useState(totalCharacters);//filterd
  const [hoverCharacter, setHoverCharacter] = useState<Character | undefined>(undefined);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const timeout = useRef<any>(undefined);

  const toolTip = useMemo(() => {
    if(hoverCharacter){
      const skills = hoverCharacter.Skills.filter(skill => !skill.isShadowSkill());
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
    }
    return <></>;
  }, [hoverCharacter, translator]);

  const handleMouseMove = useCallback(({ pageX, pageY, clientX, clientY, character }) =>{
    const scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    const scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    const x = pageX || clientX + scrollX;
    const y = pageY || clientY + scrollY;
    if(timeout.current){
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(() => {
      clearTimeout(timeout.current);
      setHoverCharacter(character);
      setMousePosition({x, y})
    }, 300);
  }, []);
  const handleMouseLeave = useCallback(() => {
    clearTimeout(timeout.current);
    setHoverCharacter(undefined);
  }, []);

  return (<>
    <Background imageLoader={imageLoader} />
    <main className={styles.content}>
      <section className={styles.container}>
        {/*模拟边框 begin*/}
        <svg version="1.1"
          className={styles.borderSVG}
          xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="2%" x2="0" y2="98%" className={styles.border}/>
          <line x1="100%" y1="2%" x2="100%" y2="98%" className={styles.border}/>
          <line x1="1%" y1="0" x2="99%" y2="0" className={styles.border}/>
          <line x1="1%" y1="100%" x2="99%" y2="100%" className={styles.border}/>
        </svg>
        <div className={classNames(styles.cor, styles.corLeftTop)} />
        <div className={classNames(styles.cor, styles.corLeftBottom)} />
        <div className={classNames(styles.cor, styles.corRightTop)} />
        <div className={classNames(styles.cor, styles.corRightBottom)} />
        {/*模拟边框 end*/}

        <SearchBar translator={translator} totalCharacters={totalCharacters} setCharacters={setCharacters}/>
        <div className={styles.list}>
          {characters.map((character) => {
            const cardId = totalCharacters.indexOf(character);
            return (<CharacterCard
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
              onMouseMove={(event: React.MouseEvent, character: Character) => handleMouseMove({ ...event, character })}
              onMouseLeave={handleMouseLeave}
            />)
          })}
        </div>
      </section>
      {hoverCharacter && <div className={styles.tooltip} style={{top: mousePosition.y, left: mousePosition.x}}>
        {toolTip}
      </div>}
    </main>
  </>)
};

export default Characters;
