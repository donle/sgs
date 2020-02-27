import { getNationalityRawText } from 'core/characters/character';
import { Player } from 'core/player/player';
import { Translation } from 'core/translations/translation_json_tool';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './player.module.css';

type PlayerCardProps = {
  player: Player | undefined;
  translator: Translation;
};

@mobxReact.observer
export class PlayerCard extends React.Component<PlayerCardProps> {
  @mobx.computed
  get PlayerCharacter() {
    if (this.props.player === undefined) {
      return undefined;
    }

    try {
      return this.props.player.CharacterId
        ? this.props.player.Character
        : undefined;
    } catch {
      return undefined;
    }
  }

  render() {
    return (
      <div className={styles.playerCard}>
        {this.props.player ? (
          <>
            <p>{this.props.player.Name}</p>
            {this.PlayerCharacter && (
              <div className={styles.playerCardInside}>
                <span className={styles.nationality}>
                  {this.props.translator.tr(
                    getNationalityRawText(this.PlayerCharacter.Nationality),
                  )}
                </span>
                <span>{this.PlayerCharacter.Name}</span>
                <span>
                  {this.props.player.Hp}/{this.props.player.MaxHp}
                </span>
              </div>
            )}
          </>
        ) : (<p className={styles.waiting}>{this.props.translator.tr('waiting')}</p>)}
      </div>
    );
  }
}
