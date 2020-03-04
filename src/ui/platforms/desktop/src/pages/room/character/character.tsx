import classNames from 'classnames';
import { Character, getNationalityRawText } from 'core/characters/character';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './character.module.css';

export type CharacterCardProps = {
  character: Character;
  translator: ClientTranslationModule;
  onClick?(character: Character): void;
  disabled?: boolean;
  className?: string;
};

export class CharacterCard extends React.Component<CharacterCardProps> {
  private readonly onClick = () => {
    if (!this.props.disabled) {
      this.props.onClick && this.props.onClick(this.props.character);
    }
  };

  render() {
    const { character, translator, className } = this.props;
    return (
      <div
        className={classNames(styles.characterCard, className)}
        onClick={this.onClick}
      >
        <p>
          {translator.tr(getNationalityRawText(character.Nationality))}{' '}
          {translator.tr(character.Name)}
        </p>
      </div>
    );
  }
}
