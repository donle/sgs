import { getNationalityRawText } from 'core/characters/character';
import { Player } from 'core/player/player';
import { Translation } from 'core/translations/translation_json_tool';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './player.module.css';

type PlayerCardProps = {
  player: Player;
  translator: Translation;
};

@mobxReact.observer
export class PlayerCard extends React.Component<PlayerCardProps> {
  render() {
    const character = this.props.player.CharacterId
      ? this.props.player.Character
      : undefined;

    return (
      <div className={styles.playerCard}>
        <p>{this.props.player.Name}</p>
        {character && (
          <div className={styles.playerCardInside}>
            <span className={styles.nationality}>
              {this.props.translator.tr(
                getNationalityRawText(character.Nationality),
              )}
            </span>
            <span>{character.Name}</span>
            <span>
              {this.props.player.Hp}/{this.props.player.MaxHp}
            </span>
          </div>
        )}
      </div>
    );
  }
}
