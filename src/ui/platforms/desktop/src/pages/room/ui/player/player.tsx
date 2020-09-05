import classNames from 'classnames';
import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerRole } from 'core/player/player_props';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { NationalityBadge, PlayerPhaseBadge } from 'ui/badge/badge';
import { FlatClientCard } from 'ui/card/flat_card';
import { Hp } from 'ui/hp/hp';
import { Tooltip } from 'ui/tooltip/tooltip';
import { CardSelectorDialog } from '../dialog/card_selector_dialog/card_selector_dialog';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { AwakenSkillMark, LimitSkillMark, Mark } from '../mark/mark';
import { Mask } from '../mask/mask';
import { PlayingBar } from '../playing_bar/playing_bar';
import { SwitchAvatar } from '../switch_avatar/switch_avatar';
import styles from './player.module.css';

type PlayerCardProps = {
  player: ClientPlayer | undefined;
  playerPhase?: PlayerPhase;
  translator: ClientTranslationModule;
  presenter: RoomPresenter;
  imageLoader: ImageLoader;
  inAction: boolean;
  store: RoomStore;
  incomingMessage?: string;
  onCloseIncomingMessage?(): void;
  actionTimeLimit?: number;
  disabled?: boolean;
  delight?: boolean;
  onClick?(selected: boolean): void;
  selected?: boolean;
};

@mobxReact.observer
export class PlayerCard extends React.Component<PlayerCardProps> {
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  @mobx.observable.ref
  PlayerImage: () => JSX.Element;
  @mobx.observable.ref
  PlayerRoleCard: () => JSX.Element;

  @mobx.observable.ref
  mainImage: string | undefined;
  @mobx.observable.ref
  sideImage: string | undefined;

  private onTooltipOpeningTimer: NodeJS.Timer;
  private openedDialog: string | undefined;

  private readonly onClick = mobx.action(() => {
    if (this.props.disabled === false) {
      this.props.onClick && this.props.onClick(!this.props.selected);
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

  getPlayerEquips() {
    const { player, translator, imageLoader } = this.props;
    const equips = player?.getCardIds(PlayerCardsArea.EquipArea).map(cardId => Sanguosha.getCardById(cardId));
    if (!equips) {
      return;
    }

    return (
      <div className={styles.playerEquips} onClick={this.onClick}>
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
    }, 2000);
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
              {translator.trx(flag)}
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
              cards.length === 0 ? (
                undefined
              ) : (
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

  @mobx.action
  async componentDidUpdate() {
    if (this.PlayerCharacter) {
      this.mainImage = (await this.props.imageLoader.getCharacterImage(this.PlayerCharacter.Name)).src;
      const huashenCharacterId = this.props.player?.getHuaShenInfo()?.characterId;
      const huashenCharacter =
        huashenCharacterId !== undefined ? Sanguosha.getCharacterById(huashenCharacterId) : undefined;
      this.sideImage = huashenCharacter && (await this.props.imageLoader.getCharacterImage(huashenCharacter.Name)).src;
    }

    if (this.PlayerImage === undefined && this.PlayerCharacter) {
      mobx.runInAction(() => {
        this.PlayerImage = () => (
          <SwitchAvatar
            mainImage={this.mainImage}
            sideImage={this.sideImage}
            className={classNames(styles.playerImage, {
              [styles.dead]: this.props.player && this.props.player.Dead,
              [styles.disabled]:
                this.props.delight === false
                  ? false
                  : !(this.props.presenter.ClientPlayer && this.props.presenter.ClientPlayer.Dead) &&
                    this.props.disabled,
            })}
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

  private getOnceSkillMarks() {
    const clientPlayer = this.props.player;
    if (!clientPlayer || clientPlayer.CharacterId === undefined) {
      return;
    }

    const marks: JSX.Element[] = [];
    const limitSkills = clientPlayer.getSkills('limit');
    const awakenSkills = clientPlayer.getSkills('awaken');
    marks.push(
      ...limitSkills.map(skill => (
        <LimitSkillMark
          skillName={this.props.translator.tr(skill.Name)}
          hasUsed={this.props.store.onceSkillUsedHistory[clientPlayer.Id]?.includes(skill.Name)}
          key={skill.Name}
        />
      )),
    );
    marks.push(
      ...awakenSkills.map(skill => (
        <AwakenSkillMark
          skillName={this.props.translator.tr(skill.Name)}
          hasUsed={this.props.store.onceSkillUsedHistory[clientPlayer.Id]?.includes(skill.Name)}
          key={skill.Name}
        />
      )),
    );

    const playerMarks = clientPlayer.getAllMarks();
    for (const [markName, amount] of Object.entries(playerMarks)) {
      marks.push(<Mark amount={amount} markType={markName as MarkEnum} key={markName} />);
    }

    return marks;
  }

  render() {
    const {
      disabled,
      translator,
      inAction,
      player,
      playerPhase,
      imageLoader,
      incomingMessage,
      actionTimeLimit,
    } = this.props;
    return (
      <div className={styles.player}>
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
              closeAfter={3}
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
                      [styles.selected]: this.props.selected && !disabled,
                      [styles.highlighted]: playerPhase !== undefined,
                    })}
                  />
                  {this.PlayerImage !== undefined && <this.PlayerImage />}
                  {this.PlayerRoleCard !== undefined && <this.PlayerRoleCard />}
                  {this.props.player && this.props.player.CharacterId !== undefined && (
                    <NationalityBadge className={styles.playerCharacter} nationality={this.props.player.Nationality}>
                      {translator.tr(this.PlayerCharacter.Name)}
                    </NationalityBadge>
                  )}
                  {player.Role !== PlayerRole.Unknown && (
                    <Mask
                      className={styles.playerRole}
                      lockedRole={player.Dead || player.Role === PlayerRole.Lord ? player.Role : undefined}
                    />
                  )}
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
              {!player.isFaceUp() && (
                <img className={styles.status} src={imageLoader.getTurnedOverCover().src} alt="" />
              )}
              {player.hasDrunk() > 0 && <div className={styles.drunk} />}
              {player.ChainLocked && <img className={styles.chain} src={imageLoader.getChainImage().src} alt="" />}

              <p className={styles.playerSeats}>{translator.tr(`seat ${player.Position}`)}</p>
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
          {player && <span className={styles.playerStatus}>{translator.tr(player.getPlayerStatus() || '')}</span>}
          {inAction && <PlayingBar className={styles.playBar} playTime={actionTimeLimit} />}
          {this.onTooltipOpened && this.PlayerCharacter && (
            <Tooltip position={['top']}>{this.createTooltipContent()}</Tooltip>
          )}
        </div>
        {this.getPlayerEquips()}
        <div className={styles.marks}>{this.getOnceSkillMarks()}</div>
      </div>
    );
  }
}
