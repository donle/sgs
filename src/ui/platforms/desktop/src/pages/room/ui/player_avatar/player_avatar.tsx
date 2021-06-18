import classNames from 'classnames';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerRole } from 'core/player/player_props';
import { MarkEnum } from 'core/shares/types/mark_list';
import { Skill, TriggerSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { NationalityBadge } from 'ui/badge/badge';
import { SkillButton } from 'ui/button/skill_button';
import { Hp } from 'ui/hp/hp';
import { Tooltip } from 'ui/tooltip/tooltip';
import { CardSelectorDialog } from '../dialog/card_selector_dialog/card_selector_dialog';
import { AwakenSkillMark, LimitSkillMark, Mark } from '../mark/mark';
import { Mask } from '../mask/mask';
import { SwitchAvatar } from '../switch_avatar/switch_avatar';
import styles from './player_avatar.module.css';
import { getSkinName } from '../../ui/switch_avatar/switch_skin';

type PlayerAvatarProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  updateFlag: boolean;
  imageLoader: ImageLoader;
  incomingMessage?: string;
  onCloseIncomingMessage?(): void;
  disabled?: boolean;
  selected?: boolean;
  delight?: boolean;
  skinName?: string;
  onClick?(player: Player, selected: boolean): void;
  onClickSkill?(skill: Skill, selected: boolean): void;
  isSkillDisabled(skill: Skill): boolean;
};

@mobxReact.observer
export class PlayerAvatar extends React.Component<PlayerAvatarProps> {
  @mobx.observable.ref
  skillSelected: boolean = false;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  private onTooltipOpeningTimer: NodeJS.Timer;
  @mobx.observable.ref
  PlayerRoleCard: () => JSX.Element;
  @mobx.observable.ref
  PlayerImage: () => JSX.Element;
  @mobx.observable.ref
  private skinName: string;

  @mobx.observable.ref
  mainImage: string | undefined;
  @mobx.observable.ref
  sideImage: string | undefined;
  @mobx.observable.ref
  autoHidePlayerName: boolean = true;

  private openedDialog: string | undefined;

  private readonly showPlayerName = mobx.action(() => {
    this.autoHidePlayerName = false;
  });

  private readonly hidePlayerName = mobx.action(() => {
    this.autoHidePlayerName = true;
  });

  @mobx.action
  private readonly onClick = () => {
    if (this.props.disabled === false) {
      this.props.onClick && this.props.onClick(this.props.presenter.ClientPlayer!, !this.props.selected);
    }
  };

  @mobx.action
  private readonly onClickSkill = (skill: Skill) => () => {
    if (this.props.store.selectedSkill !== undefined && skill !== this.props.store.selectedSkill) {
      return;
    }

    if (skill instanceof TriggerSkill) {
      return;
    }

    this.skillSelected = !this.skillSelected;
    this.props.onClickSkill && this.props.onClickSkill(skill, this.skillSelected);
  };

  @mobx.action
  getSkillSelected() {
    if (this.props.store.selectedSkill === undefined) {
      this.skillSelected = false;
    }

    return this.skillSelected;
  }

  private getSkillButtons() {
    const { presenter, translator, isSkillDisabled, imageLoader } = this.props;
    const skills =
      presenter.ClientPlayer && presenter.ClientPlayer.CharacterId !== undefined
        ? presenter.ClientPlayer.getPlayerSkills(undefined, true).filter(skill => !skill.isShadowSkill())
        : [];

    return (
      <>
        <div className={styles.playerSkills}>
          {skills.map((skill, index) => (
            <SkillButton
              key={index}
              imageLoader={imageLoader}
              translator={translator}
              skill={skill}
              selected={this.getSkillSelected() && this.props.store.selectedSkill === skill}
              size={skills.length % 2 === 0 ? 'normal' : index === skills.length - 1 ? 'wide' : 'normal'}
              className={styles.playerSkill}
              onClick={this.onClickSkill(skill)}
              disabled={isSkillDisabled(skill)}
            />
          ))}
        </div>
        <div className={styles.userSideEffectSkillList}>{this.getSideEffectSkills()}</div>
      </>
    );
  }

  private getSkillTags() {
    const { translator, presenter } = this.props;
    const flags = presenter.ClientPlayer && presenter.ClientPlayer.getAllVisibleTags();
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

  private readonly onOutsideAreaTagClicked = (name: string, cards: (CardId | CharacterId)[]) => () => {
    const player = this.props.presenter.ClientPlayer;
    if (
      player === undefined ||
      player.CharacterId === undefined ||
      (this.openedDialog === undefined && this.props.store.selectorDialog !== undefined)
    ) {
      return;
    }

    if (this.openedDialog === name) {
      this.openedDialog = undefined;
      this.props.presenter.closeDialog();
    } else {
      this.openedDialog = name;
      this.props.presenter.createDialog(
        <CardSelectorDialog
          title={this.props.translator.tr(name)}
          isCharacterCard={player.isCharacterOutsideArea(name)}
          imageLoader={this.props.imageLoader}
          options={cards}
          translator={this.props.translator}
        />,
      );
    }
  };

  private getOutsideAreaCards() {
    const { translator, presenter } = this.props;
    const cards = presenter.ClientPlayer?.getOutsideAreaCards();
    return (
      cards && (
        <div className={styles.outsideArea}>
          {Object.entries<CardId[]>(cards)
            .map(([areaName, cards], index) =>
              cards.length === 0 ? undefined : (
                <span
                  key={index}
                  className={classNames(styles.skillTag, styles.clickableSkillTag)}
                  onClick={this.onOutsideAreaTagClicked(areaName, cards)}
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

  getSideEffectSkills() {
    const { translator, imageLoader, store } = this.props;

    const player = this.props.presenter.ClientPlayer;
    if (player === undefined || player.CharacterId === undefined) {
      return;
    }

    return store.room
      .getSideEffectSkills(player)
      .filter(skillName => !Sanguosha.isShadowSkillName(skillName))
      .map((skillName, index) => {
        const skill = Sanguosha.getSkillBySkillName(skillName);
        return (
          <SkillButton
            imageLoader={imageLoader}
            translator={translator}
            skill={skill}
            selected={this.getSkillSelected() && this.props.store.selectedSkill === skill}
            size="normal"
            key={index}
            className={classNames(styles.playerSkill, styles.sideSkill)}
            disabled={this.props.store.room.isGameOver() || !skill.canUse(this.props.store.room, player)}
            onClick={this.onClickSkill(skill)}
          />
        );
      });
  }

  @mobx.action
  private readonly openTooltip = () => {
    this.onTooltipOpeningTimer = setTimeout(() => {
      this.onTooltipOpened = true;
    }, 500);
  };
  @mobx.action
  private readonly closeTooltip = () => {
    this.onTooltipOpeningTimer && clearTimeout(this.onTooltipOpeningTimer);
    this.onTooltipOpened = false;
  };
  createTooltipContent() {
    const { translator, presenter } = this.props;
    const skills =
      presenter.ClientPlayer?.CharacterId !== undefined
        ? presenter.ClientPlayer.getPlayerSkills().filter(skill => !skill.isShadowSkill())
        : [];
    return skills.map((skill, index) => (
      <div className={styles.skillInfo} key={index}>
        <div className={styles.skillItem}>
          <span className={styles.skillName}>{translator.trx(skill.Name)}</span>
          <span dangerouslySetInnerHTML={{ __html: translator.tr(skill.Description) }} />
        </div>
      </div>
    ));
  }

  @mobx.action
  async componentDidUpdate() {
    if (this.props.presenter.ClientPlayer && this.props.presenter.ClientPlayer.CharacterId !== undefined) {
      this.mainImage = (
        await this.props.imageLoader.getCharacterImage(
          this.props.presenter.ClientPlayer.Character.Name,
          this.props.presenter.ClientPlayer.Id,
          this.skinName,
        )
      ).src;
      const huashenCharacterId = this.props.presenter.ClientPlayer.getHuaShenInfo()?.characterId;
      const huashenCharacter =
        huashenCharacterId !== undefined ? Sanguosha.getCharacterById(huashenCharacterId) : undefined;
      this.sideImage =
        huashenCharacter &&
        (await this.props.imageLoader.getCharacterImage(huashenCharacter.Name, this.props.presenter.ClientPlayer.Id))
          .src;
    }

    if (
      this.PlayerImage === undefined &&
      this.props.presenter.ClientPlayer &&
      this.props.presenter.ClientPlayer.CharacterId !== undefined
    ) {
      mobx.runInAction(() => {
        this.PlayerImage = () => (
          <SwitchAvatar
            mainImage={this.mainImage}
            sideImage={this.sideImage}
            className={classNames(styles.playerImage, {
              [styles.dead]: this.props.presenter.ClientPlayer && this.props.presenter.ClientPlayer.Dead,
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
      this.props.presenter.ClientPlayer &&
      this.props.presenter.ClientPlayer.Dead &&
      this.props.presenter.ClientPlayer.Role !== PlayerRole.Unknown
    ) {
      const image = await this.props.imageLoader.getPlayerRoleCard(
        this.props.presenter.ClientPlayer.Role,
        this.props.store.room.Info.gameMode,
      );
      mobx.runInAction(() => {
        this.PlayerRoleCard = () => <img className={styles.playerRoleCard} alt={image.alt} src={image.src} />;
      });
    }
  }

  private readonly onCloseIncomingMessageCallback = () => {
    this.props.onCloseIncomingMessage && this.props.onCloseIncomingMessage();
  };

  private getOnceSkillMarks() {
    const clientPlayer = this.props.presenter.ClientPlayer;
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
          tagPosition="left"
        />
      )),
    );
    marks.push(
      ...awakenSkills.map(skill => (
        <AwakenSkillMark
          skillName={this.props.translator.tr(skill.Name)}
          hasUsed={this.props.store.onceSkillUsedHistory[clientPlayer.Id]?.includes(skill.Name)}
          key={skill.Name}
          tagPosition="left"
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
    const clientPlayer = this.props.presenter.ClientPlayer;
    const character = clientPlayer?.CharacterId !== undefined ? clientPlayer?.Character : undefined;
    if (clientPlayer && character) {
      this.skinName = getSkinName(clientPlayer.Character?.Name, clientPlayer?.Id);
    }
    return (
      <>
        <div
          className={classNames(styles.playerCard)}
          onClick={this.onClick}
          onMouseEnter={this.openTooltip}
          onMouseLeave={this.closeTooltip}
          onMouseOver={this.showPlayerName}
          onMouseOut={this.hidePlayerName}
        >
          {this.props.incomingMessage && (
            <Tooltip
              className={styles.incomingMessage}
              position={['slightTop']}
              closeAfter={3}
              closeCallback={this.onCloseIncomingMessageCallback}
            >
              {this.props.incomingMessage}
            </Tooltip>
          )}
          <span
            className={classNames(styles.playerName, {
              [styles.autoHide]: character && this.autoHidePlayerName,
            })}
          >
            {clientPlayer?.Name}
          </span>
          <span
            className={classNames(styles.highlightBorder, {
              [styles.selected]: this.props.selected && !this.props.disabled,
            })}
          />
          {this.PlayerImage !== undefined && <this.PlayerImage />}
          {clientPlayer && character && (
            <NationalityBadge nationality={clientPlayer.Nationality} className={styles.playCharacterName}>
              {this.props.translator.tr(character.Name)}
            </NationalityBadge>
          )}
          {clientPlayer && clientPlayer.Role !== PlayerRole.Unknown && (
            <Mask
              className={styles.playerRole}
              displayedRole={clientPlayer.Role}
              gameMode={this.props.store.room.Info.gameMode}
              lockedRole={clientPlayer.Dead || clientPlayer.Role === PlayerRole.Lord ? clientPlayer.Role : undefined}
              hideDisplay={true}
            />
          )}

          {!clientPlayer?.isFaceUp() && (
            <img className={styles.status} src={this.props.imageLoader.getTurnedOverCover().src} alt="" />
          )}
          {clientPlayer && clientPlayer.hasDrunk() > 0 && <div className={styles.drunk} />}
          {clientPlayer && clientPlayer.ChainLocked && (
            <img className={styles.chain} src={this.props.imageLoader.getChainImage().src} alt="" />
          )}

          {this.PlayerRoleCard !== undefined && <this.PlayerRoleCard />}

          {this.getSkillButtons()}
          {clientPlayer && (
            <Hp hp={clientPlayer.Hp} className={styles.playerHp} maxHp={clientPlayer.MaxHp} size="regular" />
          )}
          <div className={styles.playerTags}>
            {this.getSkillTags()}
            {this.getOutsideAreaCards()}
          </div>
          {this.onTooltipOpened && clientPlayer?.CharacterId !== undefined && (
            <Tooltip position={['left']}>{this.createTooltipContent()}</Tooltip>
          )}
        </div>
        <div className={styles.marks}>{this.getOnceSkillMarks()}</div>
      </>
    );
  }
}
