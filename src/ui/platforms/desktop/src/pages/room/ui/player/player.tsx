import classNames from 'classnames';
import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
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
import { NationalityBadge, PlayerPhaseBadge } from 'ui/badge/badge';
import { FlatClientCard } from 'ui/card/flat_card';
import { Hp } from 'ui/hp/hp';
import { Tooltip } from 'ui/tooltip/tooltip';
import { CardSelectorDialog } from '../dialog/card_selector_dialog/card_selector_dialog';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { Mask } from '../mask/mask';
import { PlayingBar } from '../playing_bar/playing_bar';
import styles from './player.module.css';

type PlayerCardProps = {
  player: ClientPlayer | undefined;
  playerPhase?: PlayerPhase;
  translator: ClientTranslationModule;
  presenter: RoomPresenter;
  imageLoader: ImageLoader;
  inAction: boolean;
  incomingMessage?: string;
  onCloseIncomingMessage?(): void;
  actionTimeLimit?: number;
  disabled?: boolean;
  delight?: boolean;
  onClick?(selected: boolean): void;
};

@mobxReact.observer
export class PlayerCard extends React.Component<PlayerCardProps> {
  @mobx.observable.ref
  selected: boolean = false;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  @mobx.observable.ref
  PlayerImage: () => JSX.Element;
  @mobx.observable.ref
  PlayerRoleCard: () => JSX.Element;

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
    const { player, translator, imageLoader } = this.props;
    const equips = player?.getCardIds(PlayerCardsArea.EquipArea).map(cardId => Sanguosha.getCardById(cardId));
    if (!equips) {
      return;
    }

    return (
      <div className={styles.playerEquips}>
        {equips.map(equip => (
          <FlatClientCard
            card={equip}
            imageLoader={imageLoader}
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
          <DelayedTrickIcon
            imageLoader={this.props.imageLoader}
            card={Sanguosha.getCardById(cardId)}
            translator={this.props.translator}
          />
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
          <span dangerouslySetInnerHTML={{ __html: translator.tr(skill.Description) }} />
        </div>
      </div>
    ));
  }

  async componentDidUpdate() {
    if (this.PlayerImage === undefined && this.PlayerCharacter) {
      const image = await this.props.imageLoader.getCharacterImage(this.PlayerCharacter.Name);
      mobx.runInAction(() => {
        this.PlayerImage = () => (
          <img
            className={classNames(styles.playerImage, {
              [styles.dead]: this.props.player && this.props.player.Dead,
              [styles.disabled]:
                this.props.delight === false
                  ? false
                  : !(this.props.presenter.ClientPlayer && this.props.presenter.ClientPlayer.Dead) &&
                    this.props.disabled,
            })}
            alt={image.alt}
            src={image.src}
          />
        );
      });
    } else if (
      this.PlayerRoleCard === undefined &&
      this.props.player &&
      this.props.player.Dead &&
      this.props.player.Role !== PlayerRole.Unknown
    ) {
      const image = await this.props.imageLoader.getPlayerRoleCard(this.props.player.Role);
      mobx.runInAction(() => {
        this.PlayerRoleCard = () => <img className={styles.playerRoleCard} alt={image.alt} src={image.src} />;
      });
    }
  }

  private readonly onCloseIncomingMessageCallback = () => {
    this.props.onCloseIncomingMessage && this.props.onCloseIncomingMessage();
  };

  render() {
    const { disabled, translator, inAction, player, playerPhase, imageLoader, incomingMessage } = this.props;
    return (
      <div
        id={player && player.Id}
        className={styles.playerCard}
        onClick={this.onClick}
        onMouseEnter={this.openTooltip}
        onMouseLeave={this.closeTooltip}
      >
        {incomingMessage && (
          <Tooltip
            className={styles.incomingMessage}
            position={['top']}
            closeAfter={5}
            closeCallback={this.onCloseIncomingMessageCallback}
          >
            {incomingMessage}
          </Tooltip>
        )}
        {player ? (
          <>
            <p
              className={classNames(styles.playerName, {
                [styles.aligned]: this.PlayerCharacter !== undefined,
              })}
            >
              {player.Name}
            </p>
            {this.PlayerCharacter ? (
              <>
                <span
                  className={classNames(styles.highlightBorder, {
                    [styles.selected]: this.getSelected() && !disabled,
                    [styles.highlighted]: playerPhase !== undefined,
                  })}
                />
                {this.PlayerImage !== undefined && <this.PlayerImage />}
                {this.PlayerRoleCard !== undefined && <this.PlayerRoleCard />}
                {this.PlayerCharacter && (
                  <NationalityBadge className={styles.playerCharacter} nationality={this.PlayerCharacter.Nationality}>
                    {translator.tr(this.PlayerCharacter.Name)}
                  </NationalityBadge>
                )}
                {player.Role !== PlayerRole.Unknown && (
                  <Mask
                    className={styles.playerRole}
                    lockedRole={player.Dead || player.Role === PlayerRole.Lord ? player.Role : undefined}
                    disabled={player.Dead || player.Role === PlayerRole.Lord}
                  />
                )}
                {this.getPlayerEquips()}
                <div className={styles.playerHp}>
                  <Hp hp={player.Hp} maxHp={player.MaxHp} size="small" />
                </div>
                <span className={styles.handCardsNumberBg}>
                  <img
                    className={styles.handCardsNumberBgImage}
                    src={imageLoader.getCardNumberBgImage().src}
                    alt={''}
                  />
                  <span className={styles.handCardsNumber}>{player.getCardIds(PlayerCardsArea.HandArea).length}</span>
                </span>
              </>
            ) : (
              <img
                className={classNames(styles.playerImage, styles.playerUnknownImage)}
                alt={player.Name}
                src={imageLoader.getUnknownCharacterImage().src}
              />
            )}
            {this.getPlayerJudgeCards()}
            {!player.isFaceUp() && <img className={styles.status} src={imageLoader.getTurnedOverCover().src} alt="" />}
            {player.hasDrunk() > 0 && <div className={styles.drunk} />}
            {player.ChainLocked && <img className={styles.chain} src={imageLoader.getChainImage().src} alt="" />}

            <p className={styles.playerSeats}>{translator.tr(`number ${player.Position}`)}</p>
          </>
        ) : (
          <img
            className={classNames(styles.playerImage, styles.playerUnknownImage)}
            alt={translator.tr('waiting')}
            src={imageLoader.getEmptySeatImage().src}
          />
        )}
        {playerPhase !== undefined && (
          <PlayerPhaseBadge stage={playerPhase} translator={translator} className={styles.playerPhaseBadge} />
        )}
        <div className={styles.playerTags}>
          {this.getSkillTags()}
          {this.getOutsideAreaCards()}
        </div>
        {inAction && <PlayingBar className={styles.playBar} playTime={this.props.actionTimeLimit} />}
        {this.onTooltipOpened && this.PlayerCharacter && (
          <Tooltip position={['top']}>{this.createTooltipContent()}</Tooltip>
        )}
      </div>
    );
  }
}
