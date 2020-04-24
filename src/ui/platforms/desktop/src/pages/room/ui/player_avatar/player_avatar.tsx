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
      //TODO: callback to record trigger skill auto trigger status
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
        ? presenter.ClientPlayer.getPlayerSkills().filter((skill) => !skill.isShadowSkill())
        : [];

    return (
      <div className={styles.playerSkills}>
        {skills.map((skill) => (
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
    );
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
        {this.getSkillButtons()}
        {clientPlayer && (
          <Hp hp={clientPlayer.Hp} className={styles.playerHp} maxHp={clientPlayer.MaxHp} size="regular" />
        )}
      </div>
    );
  }
}
