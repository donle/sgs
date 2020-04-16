import classNames from 'classnames';
import { CardType } from 'core/cards/card';
import { getNationalityRawText } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerRole } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { NationalityBadge, PlayerPhaseBadge } from '../badge/badge';
import { FlatClientCard } from '../card/flat_card';
import { Hp } from '../hp/hp';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { Mask } from '../mask/mask';
import styles from './player.module.css';

type PlayerCardProps = {
  player: Player | undefined;
  playerPhase?: PlayerPhase;
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
    const { disabled, translator, player, playerPhase } = this.props;
    return (
      <div
        id={player && player.Id}
        className={classNames(styles.playerCard, {
          [styles.selected]: this.getSelected() && !disabled,
          [styles.highlighted]: playerPhase !== undefined,
        })}
        onClick={this.onClick}
      >
        {player ? (
          <>
            <p
              className={classNames(styles.playerName, {
                [styles.aligned]: this.PlayerCharacter !== undefined,
              })}
            >
              {player.Name}
            </p>
            {this.PlayerCharacter && (
              <>
                <NationalityBadge
                  className={styles.playerCharacter}
                  vertical={true}
                  variant={nationalityText as any}
                  translator={translator}
                >
                  {translator.tr(this.PlayerCharacter.Name)}
                </NationalityBadge>
                {player.Role !== PlayerRole.Unknown && (
                  <Mask
                    className={styles.playerRole}
                    translator={translator}
                    lockedRole={player.Dead || player.Role === PlayerRole.Lord ? player.Role : undefined}
                    disabled={player.Dead || player.Role === PlayerRole.Lord}
                  />
                )}
                {this.getPlayerEquips()}
                <div className={styles.playerHp}>
                  <Hp hp={player.Hp} maxHp={player.MaxHp} size="small" />
                </div>
                <span className={styles.handCardsNumberBg}>
                  <span className={styles.handCardsNumber}>{player.getCardIds(PlayerCardsArea.HandArea).length}</span>
                </span>
              </>
            )}
            {this.getPlayerJudgeCards()}
          </>
        ) : (
          <p className={styles.waiting}>{translator.tr('waiting')}</p>
        )}
        {playerPhase !== undefined && <PlayerPhaseBadge stage={playerPhase} translator={translator} className={styles.playerPhaseBadge} />}
      </div>
    );
  }
}
