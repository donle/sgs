import classNames from 'classnames';
import { CardId } from 'core/cards/libs/card_props';
import { Player } from 'core/player/player';
import { PlayerRole } from 'core/player/player_props';
import { Skill, TriggerSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { Tooltip } from 'ui/tooltip/tooltip';
import { NationalityBadge } from '../badge/badge';
import { CardSelectorDialog } from '../dialog/card_selector_dialog/card_selector_dialog';
import { Hp } from '../hp/hp';
import { Mask } from '../mask/mask';
import styles from './player_avatar.module.css';

type PlayerAvatarProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  updateFlag: boolean;
  imageLoader: ImageLoader;
  disabled?: boolean;
  onClick?(player: Player, selected: boolean): void;
  onClickSkill?(skill: Skill, selected: boolean): void;
  isSkillDisabled(skill: Skill): boolean;
};

@mobxReact.observer
export class PlayerAvatar extends React.Component<PlayerAvatarProps> {
  @mobx.observable.ref
  selected: boolean = false;
  @mobx.observable.ref
  skillSelected: boolean = false;
  @mobx.observable.ref
  onTooltipOpened: boolean = false;
  private onTooltipOpeningTimer: NodeJS.Timer;
  @mobx.observable.ref
  PlayerRoleCard: () => JSX.Element;

  @mobx.observable.ref
  PlayerImage: () => JSX.Element;

  private openedDialog: string | undefined;

  @mobx.action
  private readonly onClick = () => {
    if (this.props.disabled === false) {
      this.selected = !this.selected;
      this.props.onClick && this.props.onClick(this.props.presenter.ClientPlayer!, this.selected);
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
  getSelected() {
    if (!!this.props.disabled) {
      this.selected = false;
    }
    return this.selected;
  }

  @mobx.action
  getSkillSelected() {
    if (this.props.store.selectedSkill === undefined) {
      this.skillSelected = false;
    }

    return this.skillSelected;
  }

  private getSkillButtons() {
    const { presenter, translator, isSkillDisabled } = this.props;
    const skills =
      presenter.ClientPlayer && presenter.ClientPlayer.CharacterId !== undefined
        ? presenter.ClientPlayer.getPlayerSkills(undefined, true).filter(
            skill => !skill.isShadowSkill() && !skill.isSideEffectSkill(),
          )
        : [];

    return (
      <>
        <div className={styles.playerSkills}>
          {skills.map(skill => (
            <button
              className={classNames(styles.playerSkill, {
                [styles.selected]: this.getSkillSelected() && this.props.store.selectedSkill === skill,
              })}
              onClick={this.onClickSkill(skill)}
              disabled={isSkillDisabled(skill)}
            >
              {translator.tr(skill.Name)}
            </button>
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
    const player = this.props.presenter.ClientPlayer;
    if (player === undefined || player.CharacterId === undefined) {
      return;
    }

    const sideEffectSkills = player.getSkills().filter(skill => skill.isSideEffectSkill());
    return sideEffectSkills.map((skill, index) => {
      return (
        <button
          key={index}
          className={classNames(styles.playerSkill, {
            [styles.selected]: this.getSkillSelected() && this.props.store.selectedSkill === skill,
          })}
          disabled={!skill.canUse(this.props.store.room, player)}
          onClick={this.onClickSkill(skill)}
        >
          {this.props.translator.tr(skill.Name)}
        </button>
      );
    });
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
  createTooltipContent() {
    const { translator, presenter } = this.props;
    const skills =
      presenter.ClientPlayer?.CharacterId !== undefined
        ? presenter.ClientPlayer.getPlayerSkills().filter(skill => !skill.isShadowSkill())
        : [];
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

  async componentDidUpdate() {
    if (
      this.PlayerImage === undefined &&
      this.props.presenter.ClientPlayer &&
      this.props.presenter.ClientPlayer.CharacterId
    ) {
      const image = await this.props.imageLoader.getCharacterImage(this.props.presenter.ClientPlayer.Character.Name);
      mobx.runInAction(() => {
        this.PlayerImage = () => (
          <img
            className={classNames(styles.playerImage, {
              [styles.dead]: this.props.presenter.ClientPlayer && this.props.presenter.ClientPlayer.Dead,
            })}
            alt={image.alt}
            src={image.src}
          />
        );
      });
    } else if (
      this.PlayerRoleCard === undefined &&
      this.props.presenter.ClientPlayer &&
      this.props.presenter.ClientPlayer.Dead &&
      this.props.presenter.ClientPlayer.Role !== PlayerRole.Unknown
    ) {
      const image = await this.props.imageLoader.getPlayerRoleCard(this.props.presenter.ClientPlayer.Role);
      mobx.runInAction(() => {
        this.PlayerRoleCard = () => <img className={styles.playerRoleCard} alt={image.alt} src={image.src} />;
      });
    }
  }

  render() {
    const clientPlayer = this.props.presenter.ClientPlayer;
    const character = clientPlayer?.CharacterId !== undefined ? clientPlayer?.Character : undefined;
    return (
      <div
        className={classNames(styles.playerCard, {
          [styles.selected]: this.getSelected() && !this.props.disabled,
        })}
        onClick={this.onClick}
        onMouseEnter={this.openTooltip}
        onMouseLeave={this.closeTooltip}
      >
        <span className={styles.playerName}>{clientPlayer?.Name}</span>
        {this.PlayerImage !== undefined && <this.PlayerImage />}
        {this.PlayerRoleCard !== undefined && <this.PlayerRoleCard />}
        {character && (
          <NationalityBadge nationality={character.Nationality} className={styles.playCharacterName}>
            {this.props.translator.tr(character.Name)}
          </NationalityBadge>
        )}
        {clientPlayer && clientPlayer.Role !== PlayerRole.Unknown && (
          <Mask className={styles.playerRole} displayedRole={clientPlayer.Role} disabled={true} />
        )}
        {!clientPlayer?.isFaceUp() && <p className={styles.status}>{this.props.translator.tr('turn overed')}</p>}
        {this.getSkillButtons()}
        {clientPlayer && (
          <Hp hp={clientPlayer.Hp} className={styles.playerHp} maxHp={clientPlayer.MaxHp} size="regular" />
        )}
        <div className={styles.playerTags}>
          {this.getSkillTags()}
          {this.getOutsideAreaCards()}
        </div>
        {this.onTooltipOpened && clientPlayer?.CharacterId && (
          <Tooltip position={['bottom', 'right']}>{this.createTooltipContent()}</Tooltip>
        )}
      </div>
    );
  }
}
