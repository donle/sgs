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
import { Badge } from '../badge/badge';
import { FlatClientCard } from '../card/flat_card';
import { Hp } from '../hp/hp';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
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
      return this.props.player.CharacterId !== undefined ? this.props.player.Character : undefined;
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

  getPlayerJudgeCards() {
    return (
      <div className={styles.judgeIcons}>
        {this.props.player?.getCardIds(PlayerCardsArea.JudgeArea).map(cardId => (
          <DelayedTrickIcon card={Sanguosha.getCardById(cardId)} translator={this.props.translator} />
        ))}
      </div>
    );
  }

  render() {
    const nationalityText = this.PlayerCharacter && getNationalityRawText(this.PlayerCharacter.Nationality);

    return (
      <div
        className={classNames(styles.playerCard, {
          [styles.selected]: this.getSelected() && !this.props.disabled,
        })}
        onClick={this.onClick}
      >
        {this.props.player ? (
          <>
            <p
              className={classNames(styles.playerName, {
                [styles.aligned]: this.PlayerCharacter !== undefined,
              })}
            >
              {this.props.player.Name}
            </p>
            {this.PlayerCharacter && (
              <>
                <Badge className={styles.playerCharacter} vertical={true} variant={nationalityText as any} translator={this.props.translator} blur={true}>
                  {this.props.translator.tr(this.PlayerCharacter.Name)}
                </Badge>
                {this.getPlayerEquips()}
                <div className={styles.playerHp}>
                  <Hp hp={this.props.player.Hp} maxHp={this.props.player.MaxHp} size="small" />
                </div>
                <span className={styles.handCardsNumberBg}>
                  <span className={styles.handCardsNumber}>
                    {this.props.player.getCardIds(PlayerCardsArea.HandArea).length}
                  </span>
                </span>
              </>
            )}
            {this.getPlayerJudgeCards()}
          </>
        ) : (
          <p className={styles.waiting}>{this.props.translator.tr('waiting')}</p>
        )}
      </div>
    );
  }
}
