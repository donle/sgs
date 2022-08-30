import classNames from 'classnames';
import { Card, CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterEquipSections } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerCardsArea, PlayerId, PlayerRole, PlayerStatus } from 'core/player/player_props';
import { System } from 'core/shares/libs/system';
import { MarkEnum } from 'core/shares/types/mark_list';
import { GameMode } from 'core/shares/types/room_props';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter } from 'pages/room/room.presenter';
import { RoomStore } from 'pages/room/room.store';
import { ImageProps } from 'props/image_props';
import * as React from 'react';
import { CharacterSkinInfo } from 'skins/skins';
import { Armor } from 'ui/armor/armor';
import { NationalityBadge, PlayerPhaseBadge } from 'ui/badge/badge';
import { ClientCard } from 'ui/card/card';
import { FlatClientCard } from 'ui/card/flat_card';
import { Hp } from 'ui/hp/hp';
import { Picture } from 'ui/picture/picture';
import { Tooltip } from 'ui/tooltip/tooltip';
import { getSkinName } from '../../ui/switch_avatar/switch_skin';
import { CardSelectorDialog } from '../dialog/card_selector_dialog/card_selector_dialog';
import { DelayedTrickIcon } from '../icon/delayed_trick_icon';
import { JudgeAreaDisabledIcon } from '../icon/judge_area_disabled_icon';
import { AwakenSkillMark, LimitSkillMark, Mark, SwitchSkillMark } from '../mark/mark';
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
  skinData?: CharacterSkinInfo[];
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
  mainImage: ImageProps | undefined;
  @mobx.observable.ref
  sideImage: ImageProps | undefined;
  @mobx.observable.ref
  focusedOnPlayerHandcard: boolean = false;
  @mobx.observable.ref
  autoHidePlayerName: boolean = true;
  @mobx.observable.ref
  skinName: string;
  @mobx.observable.ref
  hideRelatedSkills: boolean = true;
  @mobx.computed
  private get showPlayerHandcards() {
    return (
      this.props.store.room.Info.gameMode === GameMode.TwoVersusTwo &&
      this.props.presenter.ClientPlayer &&
      this.props.player &&
      this.props.presenter.ClientPlayer.Role === this.props.player.Role
    );
  }

  private onTooltipOpeningTimer: NodeJS.Timer;
  private openedDialog: string | undefined;
  private ifDead: boolean;

  private readonly onClick = mobx.action(() => {
    if (this.props.disabled === false) {
      this.props.onClick && this.props.onClick(!this.props.selected);
    }
  });

  private readonly showPlayerName = mobx.action(() => {
    this.autoHidePlayerName = false;
  });

  private readonly hidePlayerName = mobx.action(() => {
    this.autoHidePlayerName = true;
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
      <>
        <div className={styles.playerEquips} onClick={this.onClick}>
          {equips.map(equip => (
            <FlatClientCard
              card={equip}
              key={equip.Id}
              imageLoader={imageLoader}
              translator={translator}
              className={classNames(styles.playerEquip, {
                [styles.weapon]: equip?.is(CardType.Weapon),
                [styles.armor]: equip?.is(CardType.Shield),
                [styles.defenseRide]: equip?.is(CardType.DefenseRide),
                [styles.offenseRide]: equip?.is(CardType.OffenseRide),
                [styles.precious]: equip?.is(CardType.Precious),
              })}
            />
          ))}
        </div>
        {player && <PlayerAbortedEquipSection player={player} imageLoader={imageLoader} />}
      </>
    );
  }

  getPlayerJudgeCards() {
    const judgeAreaDisabled = this.props.player?.judgeAreaDisabled();

    return (
      <div className={styles.judgeIcons}>
        {judgeAreaDisabled ? <JudgeAreaDisabledIcon /> : <></>}
        {this.props.player?.getCardIds(PlayerCardsArea.JudgeArea).map(cardId => (
          <DelayedTrickIcon
            imageLoader={this.props.imageLoader}
            card={Sanguosha.getCardById(cardId)}
            key={cardId}
            translator={this.props.translator}
          />
        ))}
      </div>
    );
  }

  @mobx.action
  private readonly openTooltip = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.onTooltipOpeningTimer = setTimeout(() => {
      this.onTooltipOpened = true;
    }, 500);
  };

  @mobx.action
  private readonly closeTooltip = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.onTooltipOpeningTimer && clearTimeout(this.onTooltipOpeningTimer);
    this.onTooltipOpened = false;
  };

  private readonly onClickUniqueSkillTag = (name: string, items: (Card | Character)[]) => () => {
    if (this.openedDialog === name) {
      this.openedDialog = undefined;
      this.props.presenter.closeViewDialog();
    } else {
      this.openedDialog = name;
      this.props.presenter.createViewDialog(
        <CardSelectorDialog
          title={this.props.translator.tr(name)}
          isCharacterCard={items[0] instanceof Character}
          imageLoader={this.props.imageLoader}
          options={items.map(item => item.Id)}
          translator={this.props.translator}
        />,
      );
    }
  };

  private getSkillTags(viewer: PlayerId) {
    const { translator, player } = this.props;
    if (!player) {
      return undefined;
    }
    const flags = player.getAllVisibleTags(viewer);
    return (
      flags && (
        <div className={styles.skillTags}>
          {flags.map((flag, index) => {
            const items = System.SkillTagsTransformer[flag]?.(player.getFlag(flag));
            return (
              <span
                key={index}
                className={classNames(styles.skillTag, {
                  [styles.clickable]: !!items,
                })}
                onClick={items && items.length > 0 ? this.onClickUniqueSkillTag(flag, items) : undefined}
              >
                {translator.trx(flag)}
              </span>
            );
          })}
        </div>
      )
    );
  }

  private readonly onOutsideAreaTagClicked = (name: string, cards: CardId[]) => () => {
    if (this.openedDialog === name) {
      this.openedDialog = undefined;
      this.props.presenter.closeViewDialog();
    } else {
      this.openedDialog = name;
      this.props.presenter.createViewDialog(
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

  @mobx.action
  private readonly hideOrShowRelatedSkills = () => {
    this.hideRelatedSkills = !this.hideRelatedSkills;
  };

  createTooltipContent(getRelatedSkills?: boolean) {
    const { player, translator } = this.props;
    let skills =
      player?.CharacterId !== undefined ? player.getPlayerSkills().filter(skill => !skill.isShadowSkill()) : [];

    getRelatedSkills &&
      (skills = skills.reduce<Skill[]>((relatedSkills, skill) => {
        if (skill.RelatedSkills.length === 0) {
          return relatedSkills;
        }

        const notHave = skill.RelatedSkills.filter(skillName => !skills.map(skill => skill.Name).includes(skillName));
        return relatedSkills.concat(...notHave.map(skillName => Sanguosha.getSkillBySkillName(skillName)));
      }, []));
    return getRelatedSkills
      ? this.hideRelatedSkills
        ? skills.length > 0 && (
            <span className={styles.relatedSkillTiltle} onClick={this.hideOrShowRelatedSkills}>
              {this.props.translator.trx('related skill (click to show)')}
            </span>
          )
        : skills.map((skill, index) => (
            <div className={styles.skillInfo} key={index}>
              {index === 0 && (
                <span className={styles.relatedSkillTiltle} onClick={this.hideOrShowRelatedSkills}>
                  {this.props.translator.trx('related skill (click to hide)')}
                </span>
              )}
              <div className={styles.skillItem}>
                <span className={classNames(styles.skillName, styles.relatedSkill)}>{translator.trx(skill.Name)}</span>
                <span dangerouslySetInnerHTML={{ __html: translator.tr(skill.Description) }} />
              </div>
            </div>
          ))
      : skills.map((skill, index) => (
          <div className={styles.skillInfo} key={index}>
            <div className={styles.skillItem}>
              <span className={styles.skillName}>{translator.trx(skill.Name)}</span>
              <span dangerouslySetInnerHTML={{ __html: translator.tr(skill.dynamicDescription(player!)) }} />
            </div>
          </div>
        ));
  }

  private renderCharacterImage() {
    if (this.PlayerCharacter && this.props.player) {
      if (this.props.skinData) {
        this.skinName = getSkinName(
          this.props.player.Character.Name,
          this.props.player?.Id,
          this.props.skinData,
        ).skinName;

        this.props.imageLoader
          .getCharacterSkinPlay(
            this.props.player?.Character.Name,
            this.props.skinData,
            this.props.player?.Id,
            this.skinName,
          )
          .then(
            mobx.action(image => {
              this.mainImage = image;
            }),
          );
      } else {
        this.props.imageLoader.getCharacterImage(this.PlayerCharacter.Name).then(
          mobx.action(image => {
            this.mainImage = image;
          }),
        );
      }
      const huashenCharacterId = this.props.player?.getHuaShenInfo()?.characterId;
      const huashenCharacter =
        huashenCharacterId !== undefined ? Sanguosha.getCharacterById(huashenCharacterId) : undefined;

      if (huashenCharacter) {
        this.props.imageLoader.getCharacterImage(huashenCharacter.Name, this.props.player?.Id).then(
          mobx.action(image => {
            this.sideImage = image;
          }),
        );
      }
    }
  }

  async componentDidUpdate() {
    if (this.PlayerImage === undefined && this.PlayerCharacter) {
      mobx.runInAction(() => {
        this.PlayerImage = () => (
          <SwitchAvatar
            mainImage={this.mainImage?.src}
            sideImage={this.sideImage?.src}
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
      this.props.player &&
      this.ifDead !== this.props.player.Dead &&
      this.props.player.Dead &&
      this.props.player.Role !== PlayerRole.Unknown
    ) {
      const image = await this.props.imageLoader.getPlayerRoleCard(
        this.props.player.Role,
        this.props.store.room.Info.gameMode,
      );
      mobx.runInAction(() => {
        this.PlayerRoleCard = () => <Picture className={styles.playerRoleCard} image={image} />;
      });
    } else if (
      this.props.player &&
      this.ifDead !== this.props.player.Dead &&
      !this.props.player.Dead &&
      this.props.player.Role !== PlayerRole.Unknown
    ) {
      mobx.runInAction(() => {
        this.PlayerRoleCard = () => <></>;
      });
    }
    this.ifDead = this.props.player ? this.props.player.Dead : this.ifDead;
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
    const switchSkills = clientPlayer.getSkills('switch').filter(skill => !skill.isShadowSkill());
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
    marks.push(
      ...switchSkills.map(skill => (
        <SwitchSkillMark
          skillName={this.props.translator.tr(skill.Name)}
          state={this.props.store.switchSkillState[clientPlayer.Id]?.includes(skill.Name)}
          key={skill.Name}
        />
      )),
    );

    const playerMarks = clientPlayer.Marks;
    for (const [markName, amount] of Object.entries(playerMarks)) {
      marks.push(<Mark amount={amount} markType={markName as MarkEnum} key={markName} />);
    }

    return marks;
  }

  private isPlayerRoleLocked(player: ClientPlayer) {
    const { gameMode } = this.props.store.room.Info;
    return (
      gameMode === GameMode.OneVersusTwo ||
      gameMode === GameMode.TwoVersusTwo ||
      player.Dead ||
      player.Role === PlayerRole.Lord
    );
  }

  @mobx.action
  private readonly onFocusPlayerHandcard = () => {
    this.focusedOnPlayerHandcard = !this.focusedOnPlayerHandcard;
  };

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
    if (this.PlayerCharacter && (!this.mainImage || this.mainImage.alt !== this.PlayerCharacter.Name)) {
      this.renderCharacterImage();
    }

    return (
      <div className={styles.player} onMouseOver={this.showPlayerName} onMouseOut={this.hidePlayerName}>
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
              position={['slightTop']}
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
                  [styles.autoHide]: this.PlayerCharacter && this.autoHidePlayerName,
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
                      gameMode={this.props.store.room.Info.gameMode}
                      lockedRole={this.isPlayerRoleLocked(player) ? player.Role : undefined}
                    />
                  )}
                  <div className={styles.playerHp}>
                    <Armor amount={player.Armor} />
                    <Hp hp={player.Hp} maxHp={player.MaxHp} size="small" />
                  </div>
                  <span
                    className={classNames(styles.handCardsNumberBg, {
                      [styles.clickableHandcards]: this.showPlayerHandcards,
                    })}
                    onClick={this.onFocusPlayerHandcard}
                  >
                    <Picture className={styles.handCardsNumberBgImage} image={imageLoader.getCardNumberBgImage()} />
                    <span className={styles.handCardsNumber}>{player.getCardIds(PlayerCardsArea.HandArea).length}</span>
                    {this.showPlayerHandcards && this.focusedOnPlayerHandcard && this.props.player && (
                      <Tooltip position={['right', 'bottom']} className={styles.tooltip}>
                        {this.props.player.getCardIds(PlayerCardsArea.HandArea).map(cardId => (
                          <ClientCard
                            width={80}
                            card={Sanguosha.getCardById(cardId)}
                            translator={this.props.translator}
                            imageLoader={this.props.imageLoader}
                          />
                        ))}
                      </Tooltip>
                    )}
                  </span>
                </>
              ) : (
                <Picture
                  className={classNames(styles.playerImage, styles.playerUnknownImage)}
                  image={imageLoader.getUnknownCharacterImage()}
                />
              )}
              {this.getPlayerJudgeCards()}
              {!player.isFaceUp() && <Picture className={styles.status} image={imageLoader.getTurnedOverCover()} />}
              {player.hasDrunk() > 0 && <div className={styles.drunk} />}
              {player.ChainLocked && <Picture className={styles.chain} image={imageLoader.getChainImage()} />}

              <p className={styles.playerSeats}>{translator.tr(`seat ${player.Position}`)}</p>
            </>
          ) : (
            <Picture
              className={classNames(styles.playerImage, styles.playerUnknownImage)}
              image={imageLoader.getEmptySeatImage()}
            />
          )}
          {playerPhase !== undefined && (
            <PlayerPhaseBadge stage={playerPhase} translator={translator} className={styles.playerPhaseBadge} />
          )}
          <div className={styles.playerTags}>
            {this.props.presenter.ClientPlayer && this.getSkillTags(this.props.presenter.ClientPlayer.Id)}
            {this.getOutsideAreaCards()}
          </div>
          {player && player.Status !== PlayerStatus.Online && (
            <span className={styles.playerStatus}>{translator.tr(player.Status || '')}</span>
          )}
          {inAction && <PlayingBar className={styles.playBar} playTime={actionTimeLimit} />}
          {this.onTooltipOpened && this.PlayerCharacter && (
            <Tooltip position={['center', 'right']}>
              {this.createTooltipContent()}
              {this.createTooltipContent(true)}
            </Tooltip>
          )}
        </div>
        {this.getPlayerEquips()}
        <div className={styles.marks}>{this.getOnceSkillMarks()}</div>
      </div>
    );
  }
}

type PlayerAbortedEquipSectionProps = {
  player: ClientPlayer;
  imageLoader: ImageLoader;
};

class PlayerAbortedEquipSection extends React.Component<PlayerAbortedEquipSectionProps> {
  private abortedImageProp: ImageProps | undefined;

  async componentDidMount() {
    this.abortedImageProp = await this.props.imageLoader.getOthersAbortedEquipCard();
  }

  render() {
    const abortedSections = this.props.player.DisabledEquipSections;

    return (
      <div className={styles.playerAbortedEquipSections}>
        {this.abortedImageProp &&
          abortedSections.map(section => (
            <Picture
              className={classNames(styles.playerEquip, {
                [styles.weapon]: section === CharacterEquipSections.Weapon,
                [styles.armor]: section === CharacterEquipSections.Shield,
                [styles.defenseRide]: section === CharacterEquipSections.DefenseRide,
                [styles.offenseRide]: section === CharacterEquipSections.OffenseRide,
                [styles.precious]: section === CharacterEquipSections.Precious,
              })}
              key={section}
              image={this.abortedImageProp!}
            />
          ))}
      </div>
    );
  }
}
