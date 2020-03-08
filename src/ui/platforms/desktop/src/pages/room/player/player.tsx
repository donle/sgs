import classNames from 'classnames';
import { getNationalityRawText } from 'core/characters/character';
import { Player } from 'core/player/player';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './player.module.css';

type PlayerCardProps = {
  player: Player | undefined;
  translator: ClientTranslationModule;
  disabled?: boolean;
  onClick?(selected: boolean): void;
};

@mobxReact.observer
export class PlayerCard extends React.Component<PlayerCardProps> {
  @mobx.observable.ref
  selected: boolean = false;

  private readonly onClick = mobx.action(() => {
    if (this.props.disabled === false) {
      this.selected = !this.selected;
      this.props.onClick && this.props.onClick(this.selected);
    }
  });

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

  @mobx.action
  getSelected() {
    if (!!this.props.disabled) {
      this.selected = false;
    }
    return this.selected;
  }

  render() {
    return (
      <div
        className={classNames(styles.playerCard, {
          [styles.selected]: this.getSelected() && !this.props.disabled,
        })}
        onClick={this.onClick}
      >
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
                <span>
                  {this.props.translator.tr(this.PlayerCharacter.Name)}
                </span>
                <span>
                  {this.props.player.Hp}/{this.props.player.MaxHp}
                </span>
              </div>
            )}
          </>
        ) : (
          <p className={styles.waiting}>
            {this.props.translator.tr('waiting')}
          </p>
        )}
      </div>
    );
  }
}
