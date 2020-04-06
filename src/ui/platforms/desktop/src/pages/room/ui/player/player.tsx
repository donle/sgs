import classNames from 'classnames';
import { CardType } from 'core/cards/card';
import { getNationalityRawText } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { FlatClientCard } from '../card/flat_card';
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
      return this.props.player.CharacterId ? this.props.player.Character : undefined;
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

  getPlayerEquips() {
    const { player, translator } = this.props;
    const equips = player?.getCardIds(PlayerCardsArea.EquipArea).map(cardId => Sanguosha.getCardById(cardId));
    if (!equips) {
      return;
    }

    return (
      <div className={styles.playerEquips}>
        {equips.map(equip => (
            <FlatClientCard
              card={equip}
              translator={translator}
              className={classNames(styles.playerEquip, {
                [styles.weapon]: equip?.is(CardType.Weapon),
                [styles.armor]: equip?.is(CardType.Armor),
                [styles.defenseRide]: equip?.is(CardType.DefenseRide),
                [styles.offenseRide]: equip?.is(CardType.OffenseRide),
                [styles.precious]: equip?.is(CardType.Precious),
              })}
            />
        ))}
      </div>
    );
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
            <p className={styles.playerName}>{this.props.player.Name}</p>
            {this.PlayerCharacter && (
              <div className={styles.playerCardInside}>
                <span className={styles.nationality}>
                  {this.props.translator.tr(getNationalityRawText(this.PlayerCharacter.Nationality))}
                </span>
                <span>{this.props.translator.tr(this.PlayerCharacter.Name)}</span>
                <span>
                  {this.props.player.Hp}/{this.props.player.MaxHp}
                </span>
                {this.getPlayerEquips()}
              </div>
            )}
          </>
        ) : (
          <p className={styles.waiting}>{this.props.translator.tr('waiting')}</p>
        )}
      </div>
    );
  }
}
