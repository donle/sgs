import classNames from 'classnames';
import { getNationalityRawText } from 'core/characters/character';
import { Player } from 'core/player/player';
import { PlayerRole } from 'core/player/player_props';
import { Skill, TriggerSkill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import { RoomPresenter, RoomStore } from 'pages/room/room.presenter';
import * as React from 'react';
import { Tooltip } from 'ui/tooltip/tooltip';
import { NationalityBadge } from '../badge/badge';
import { Hp } from '../hp/hp';
import { Mask } from '../mask/mask';
import styles from './player_avatar.module.css';

type PlayerAvatarProps = {
  store: RoomStore;
  presenter: RoomPresenter;
  translator: ClientTranslationModule;
  updateFlag: boolean;
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
        ? presenter.ClientPlayer.getPlayerSkills().filter(skill => !skill.isShadowSkill() && !skill.isSideEffectSkill())
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
        {character && (
          <NationalityBadge
            translator={this.props.translator}
            variant={getNationalityRawText(character.Nationality) as any}
            className={styles.playCharacterName}
          >
            {this.props.translator.tr(character.Name)}
          </NationalityBadge>
        )}
        {clientPlayer && clientPlayer.Role !== PlayerRole.Unknown && (
          <Mask
            className={styles.playerRole}
            translator={this.props.translator}
            displayedRole={clientPlayer.Role}
            disabled={true}
          />
        )}
        {!clientPlayer?.isFaceUp() && <p className={styles.status}>{this.props.translator.tr('turn overed')}</p>}
        {this.getSkillButtons()}
        {clientPlayer && (
          <Hp hp={clientPlayer.Hp} className={styles.playerHp} maxHp={clientPlayer.MaxHp} size="regular" />
        )}
        {this.onTooltipOpened && clientPlayer?.CharacterId && (
          <Tooltip position={['bottom', 'right']}>{this.createTooltipContent()}</Tooltip>
        )}
      </div>
    );
  }
}
