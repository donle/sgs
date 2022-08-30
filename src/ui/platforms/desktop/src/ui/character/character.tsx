import classNames from 'classnames';
import { Character, getNationalityRawText } from 'core/characters/character';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { Armor } from 'ui/armor/armor';
import { NationalityBadge } from '../badge/badge';
import { CharacterHp } from '../hp/hp';
import styles from './character.module.css';

export type CharacterCardProps = {
  character: Character;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  onClick?(character: Character): void;
  disabled?: boolean;
  className?: string;
  size?: 'regular' | 'small' | 'tiny';
  selected?: boolean;
};

@mobxReact.observer
export class CharacterCard extends React.Component<CharacterCardProps> {
  @mobx.observable.ref
  private characterImage: string | undefined;

  private readonly onClick = () => {
    if (!this.props.disabled) {
      this.props.onClick && this.props.onClick(this.props.character);
      this.forceUpdate();
    }
  };

  @mobx.action
  async componentDidMount() {
    this.characterImage = (await this.props.imageLoader.getCharacterImage(this.props.character.Name)).src;
  }

  @mobx.action
  async componentDidUpdate() {
    this.characterImage = (await this.props.imageLoader.getCharacterImage(this.props.character.Name)).src;
  }
  render() {
    const { character, translator, className, size, selected, onClick } = this.props;
    return (
      <div
        className={classNames(styles.characterCard, className, {
          [styles.small]: size === 'small',
          [styles.tiny]: size === 'tiny',
          [styles.selected]: selected,
          [styles.clickable]: !!onClick,
        })}
        onClick={this.onClick}
      >
        {this.characterImage ? (
          <>
            <NationalityBadge size={size} nationality={character.Nationality} isLord={character.isLord()}>
              {translator.tr(character.Name)}
            </NationalityBadge>
            <div className={classNames(styles.hpContainer)}>
              {character.Armor > 0 && <Armor className={classNames(styles.characterArmor)} amount={character.Armor} />}
              <CharacterHp
                character={character}
                className={classNames(styles.characterHp, {
                  [styles.small]: size === 'small',
                  [styles.tiny]: size === 'tiny',
                })}
              />
            </div>
            <img
              className={classNames(styles.characterImage, {
                [styles.small]: size === 'small',
                [styles.tiny]: size === 'tiny',
              })}
              src={this.characterImage}
              alt=""
            />
          </>
        ) : (
          <p>
            {translator.tr(getNationalityRawText(character.Nationality))} {translator.tr(character.Name)}
          </p>
        )}
      </div>
    );
  }
}
