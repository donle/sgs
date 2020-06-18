import classNames from 'classnames';
import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { getNationalityRawText } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerRole } from 'core/player/player_props';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter } from 'pages/room/room.presenter';
import * as React from 'react';
import { Tooltip } from 'ui/tooltip/tooltip';
import { NationalityBadge, PlayerPhaseBadge } from '../badge/badge';
import { FlatClientCard } from '../card/flat_card';
import { CardSelectorDialog } from '../dialog/card_selector_dialog/card_selector_dialog';
import { Hp } from '../hp/hp';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { Mask } from '../mask/mask';
import styles from './player.module.css';

type PlayerCardProps = {
  player: ClientPlayer | undefined;
  playerPhase?: PlayerPhase;
  translator: ClientTranslationModule;
  presenter: RoomPresenter;
  imageLoader: ImageLoader;
  disabled?: boolean;
  onClick?(selected: boolean): void;
};

@mobxReact.observer
export class PlayerCard extends React.Component<PlayerCardProps> {
  @mobx.observable.ref
  selected: boolean = false;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  private onTooltipOpeningTimer: NodeJS.Timer;
  private openedDialog: string | undefined;

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

  @mobx.action
  private readonly openTooltip = () => {
    this.onTooltipOpeningTimer = setTimeout(() => {
      this.onTooltipOpened = true;
    }, 2500);
  };
  @mobx.action
  private readonly closeTooltip = () => {
    this.onTooltipOpeningTimer && clearTimeout(this.onTooltipOpeningTimer);
    this.onTooltipOpened = false;
  };

  private getSkillTags() {
    const { translator, player } = this.props;
    const flags = player && player.getAllVisibleTags();
    return (
      flags && (
        <div className={styles.skillTags}>
          {flags.map((flag, index) => (
            <span key={index} className={styles.skillTag}>
              {translator.tr(flag)}
            </span>
          ))}
        </div>
      )
    );
  }

  private readonly onOutsideAreaTagClicked = (name: string, cards: CardId[]) => () => {
    if (this.openedDialog === name) {
      this.openedDialog = undefined;
      this.props.presenter.closeDialog();
    } else {
      this.openedDialog = name;
      this.props.presenter.createDialog(
        <CardSelectorDialog imageLoader={this.props.imageLoader} options={cards} translator={this.props.translator} />,
      );
    }
  };

  private getOutsideAreaCards() {
    const { translator, player } = this.props;
    const cards = player?.getOutsideAreaCards();
    return (
      cards && (
        <div className={styles.outsideArea}>
          {Object.entries<CardId[]>(cards)
            .map(([areaName, cards], index) =>
              cards.length === 0 ? undefined : (
                <span
                  key={index}
                  className={classNames(styles.skillTag, {
                    [styles.clickableSkillTag]: player!.isOutsideAreaVisible(areaName),
                  })}
                  onClick={
                    player!.isOutsideAreaVisible(areaName) ? this.onOutsideAreaTagClicked(areaName, cards) : undefined
                  }
                >
                  [{translator.tr(areaName)}
                  {cards.length}]
                </span>
              ),
            )
            .filter(Boolean)}
        </div>
      )
    );
  }

  createTooltipContent() {
    const { player, translator } = this.props;
    const skills =
      player?.CharacterId !== undefined ? player.getPlayerSkills().filter(skill => !skill.isShadowSkill()) : [];
    return skills.map(skill => (
      <div className={styles.skillInfo}>
        <div className={styles.skillItem}>
          <span className={styles.skillName}>{translator.trx(skill.Name)}</span>
          <span
            className={styles.skillDescription}
            dangerouslySetInnerHTML={{ __html: translator.tr(skill.Description) }}
          />
        </div>
      </div>
    ));
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
        onMouseEnter={this.openTooltip}
        onMouseLeave={this.closeTooltip}
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
            {!player.isFaceUp() && <p className={styles.status}>{translator.tr('turn overed')}</p>}
            <p className={styles.playerSeats}>{translator.tr(`number ${player.Position}`)}</p>
          </>
        ) : (
          <p className={styles.waiting}>{translator.tr('waiting')}</p>
        )}
        {playerPhase !== undefined && (
          <PlayerPhaseBadge stage={playerPhase} translator={translator} className={styles.playerPhaseBadge} />
        )}
        <div className={styles.playerTags}>
          {this.getSkillTags()}
          {this.getOutsideAreaCards()}
        </div>
        {this.onTooltipOpened && this.PlayerCharacter && (
          <Tooltip position={['top']}>{this.createTooltipContent()}</Tooltip>
        )}
      </div>
    );
  }
}
