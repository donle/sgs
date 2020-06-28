import classNames from 'classnames';
import { Character, getNationalityRawText } from 'core/characters/character';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
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
};

@mobxReact.observer
export class CharacterCard extends React.Component<CharacterCardProps> {
  @mobx.observable.ref
  private characterImage: string | undefined;

  private readonly onClick = () => {
    if (!this.props.disabled) {
      this.props.onClick && this.props.onClick(this.props.character);
    }
  };

  @mobx.action
  async componentDidMount() {
    this.characterImage = (await this.props.imageLoader.getCharacterImage(this.props.character.Name)).src;
  }

  render() {
    const { character, translator, className } = this.props;
    return (
      <div className={classNames(styles.characterCard, className)} onClick={this.onClick}>
        {this.characterImage ? (
          <>
            <NationalityBadge
              nationality={character.Nationality}
              isLord={character.isLord()}
              className={styles.characterTag}
            >
              {translator.tr(character.Name)}
            </NationalityBadge>
            <CharacterHp character={character} className={styles.characterHp} />
            <img className={styles.characterImage} src={this.characterImage} alt="" />
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
