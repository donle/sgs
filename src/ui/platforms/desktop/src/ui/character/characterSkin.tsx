import classNames from 'classnames';
import { Character, getNationalityRawText } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { CharacterSkinInfo } from 'skins/skins';
import { Armor } from 'ui/armor/armor';
import { AudioService } from 'ui/audio/install';
import styles from './character.module.css';
import { NationalityBadge } from '../badge/badge';
import { CharacterHp } from '../hp/hp';

export type CharacterSkinCardProps = {
  character: Character;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  skinData?: CharacterSkinInfo[];
  skinName?: string;
  onClick?(skinName: string): void;
  disabled?: boolean;
  className?: string;
  size?: 'regular' | 'small';
  selected?: boolean;
};

@mobxReact.observer
export class CharacterSkinCard extends React.Component<CharacterSkinCardProps> {
  private skinNameList: string[] = [this.props.character.Name];
  private skinNameLists: string[] = [];
  @mobx.observable.ref
  private characterImage: string | undefined;
  @mobx.observable.ref
  private characterSkinImageL: string | undefined;
  @mobx.observable.ref
  private characterSkinImageR: string | undefined;
  private posX: number;
  @mobx.observable.ref
  private skinName: string;

  @mobx.action
  private onClick = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.TouchEvent<HTMLElement>) => {
    const clientX =
      (e as React.MouseEvent<HTMLElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLElement>).touches[0].clientX;
    this.posX = clientX;

    const characterImageElement = document.getElementsByClassName(
      classNames(styles.characterCard, this.props.className),
    )[0];
    const imagePosition = this.getOffset(characterImageElement);
    const position = {
      x: imagePosition.left,
      y: imagePosition.top,
    };
    if (this.posX < position.x + characterImageElement.clientWidth / 2 && this.posX > position.x - 100) {
      this.preSkin();
    }
    if (
      this.posX > position.x + characterImageElement.clientWidth / 2 &&
      this.posX < position.x + characterImageElement.clientWidth + 100
    ) {
      this.nextSkin();
    }
    this.props.onClick && this.skinName && this.props.onClick(this.skinName);
  };

  private getOffset(el: Element) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
    };
  }

  getskinNameList() {
    this.props.skinData
      ?.find(skinInfo => skinInfo.character === this.props.character.Name)
      ?.infos.find(skinInfo => skinInfo.images?.forEach(imageInfo => this.skinNameList.push(imageInfo.name)));
    this.skinNameLists = this.skinNameList;
    return this.skinNameLists;
  }
  nextSkin() {
    const next = this.skinNameLists.shift();
    if (next) {
      this.skinNameLists.push(next);
    }
    this.skinName = this.skinNameLists[0];
    this.getSkinImage();
  }
  preSkin() {
    const p = this.skinNameLists.pop();
    if (p) {
      this.skinNameLists.unshift(p);
    }
    this.skinName = this.skinNameLists[0];
    this.getSkinImage();
  }

  @mobx.action
  async getSkinImage() {
    this.characterImage = (
      await this.props.imageLoader.getCharacterSkinPlay(
        this.props.character.Name,
        this.props.skinData,
        undefined,
        this.skinNameLists[0],
      )
    ).src;
    this.characterSkinImageL =
      this.skinNameLists.length > 2
        ? (
            await this.props.imageLoader.getCharacterSkinPlay(
              this.props.character.Name,
              this.props.skinData,
              undefined,
              this.skinNameLists[this.skinNameLists.length - 1],
            )
          ).src
        : (this.characterSkinImageL = '');

    this.characterSkinImageR =
      this.skinNameLists.length > 1
        ? (
            await this.props.imageLoader.getCharacterSkinPlay(
              this.props.character.Name,
              this.props.skinData,
              undefined,
              this.skinNameLists[1],
            )
          ).src
        : '';
  }

  @mobx.action
  async componentDidMount() {
    this.skinNameList = [this.props.character.Name];
    this.getskinNameList();
    this.getSkinImage();
  }
  @mobx.action
  async componentDidUpdate() {
    this.skinNameList = [this.props.character.Name];
    if (!this.skinNameLists.includes(this.props.character.Name)) {
      this.getskinNameList();
    }
    this.getSkinImage();
  }

  render() {
    const { character, translator, className, size, selected } = this.props;
    return (
      <div className={classNames(styles.characterCard, className, styles.characterSkinArea)} onClick={this.onClick}>
        <div
          className={classNames(styles.characterCard, className, {
            [styles.small]: size === 'small',
            [styles.selected]: selected,
          })}
        >
          {this.characterImage ? (
            <>
              <NationalityBadge size={size} nationality={character.Nationality} isLord={character.isLord()}>
                {translator.tr(character.Name)}
              </NationalityBadge>
              <div className={classNames(styles.hpContainer)}>
                <Armor className={classNames(styles.characterArmor)} amount={character.Armor} />
                <CharacterHp
                  character={character}
                  className={classNames(styles.characterHp, { [styles.small]: size === 'small' })}
                />
              </div>

              <img
                className={classNames(styles.characterImage, { [styles.small]: size === 'small' }, styles.right)}
                src={this.characterSkinImageR}
                alt=""
              />
              <img
                className={classNames(styles.characterImage, { [styles.small]: size === 'small' }, styles.left)}
                src={this.characterSkinImageL}
                alt=""
              />

              <img
                className={classNames(styles.characterImage, {
                  [styles.small]: size === 'small',
                })}
                src={this.characterImage}
                alt=""
              />
            </>
          ) : (
            <p>
              {translator.tr(getNationalityRawText(character.Nationality))} {translator.tr(character.Name)}
            </p>
          )}
        </div>
      </div>
    );
  }
}

export type CharacterSpecProps = {
  character: Character;
  audioService: AudioService;
  translator: ClientTranslationModule;
  skinName: string;
  skinData?: CharacterSkinInfo[];
};

export class CharacterSpec extends React.Component<CharacterSpecProps> {
  private currentAudioIndexMapper: { [skillName: string]: number } = {};

  @mobx.observable.ref
  private skills: Skill[] = [];
  @mobx.observable.ref
  skinName;

  @mobx.action
  getSkillName() {
    this.skills = this.props.character.Skills.filter(skill => !skill.isShadowSkill());
    return this.skills;
  }
  @mobx.action
  onPlaySkillAudio = (skillName: string, skinName: string) => () => {
    let audioIndex: number | undefined;
    if (Sanguosha.getSkillBySkillName(skillName).audioIndex(this.props.character.Name) > 0) {
      this.currentAudioIndexMapper[skillName] = this.currentAudioIndexMapper[skillName] || 1;
      audioIndex = this.currentAudioIndexMapper[skillName];
      ++this.currentAudioIndexMapper[skillName] >
        Sanguosha.getSkillBySkillName(skillName).audioIndex(this.props.character.Name) &&
        (this.currentAudioIndexMapper[skillName] = 1);
    }

    if (this.props.skinName && this.props.skinName !== this.props.character.Name) {
      this.props.audioService.playSkillAudio(
        skillName,
        this.props.character.Gender,
        audioIndex,
        true,
        this.props.skinData,
        this.props.character.Name,
        this.props.skinName,
      );
    } else {
      this.props.audioService.playSkillAudio(
        skillName,
        this.props.character.Gender,
        audioIndex,
        true,
        [],
        this.props.character.Name,
      );
    }
  };
  @mobx.action
  onPlayDeathAudio = (characterName: string, skinName?: string) => () => {
    if (this.props.skinName && this.props.skinName !== characterName) {
      this.props.audioService.playDeathAudio(characterName, true, this.props.skinData, this.props.skinName);
    } else {
      this.props.audioService.playDeathAudio(characterName, true, []);
    }
  };
  @mobx.action
  async componentDidMount() {
    this.getSkillName();
  }
  @mobx.action
  componentDidUpdate() {
    this.skills = [];
    this.getSkillName();
    this.currentAudioIndexMapper = {};
  }

  render() {
    this.getSkillName();
    const relatedSkills =
      this.skills.length > 0
        ? this.skills.reduce<Skill[]>((skills, skill) => {
            skill.RelatedSkills.length > 0 &&
              skills.push(...skill.RelatedSkills.map(skillName => Sanguosha.getSkillBySkillName(skillName)));
            return skills;
          }, [])
        : [];
    return (
      <div className={styles.characterSpec}>
        <span className={styles.deathButton} onClick={this.onPlayDeathAudio(this.props.character.Name)}>
          {this.props.translator.trx('death audio')}
        </span>
        {this.skills.length > 0 &&
          this.skills.map(skill => (
            <div className={styles.skill} key={skill.Name}>
              <span className={styles.skillName} onClick={this.onPlaySkillAudio(skill.Name, this.props.skinName)}>
                {this.props.translator.tr(skill.Name)}
              </span>
              <span
                className={styles.skillDescription}
                dangerouslySetInnerHTML={{ __html: this.props.translator.tr(skill.Description) }}
              />
            </div>
          ))}
        {relatedSkills.length > 0 && (
          <span className={styles.relatedSkillTiltle}>{this.props.translator.trx('related skill')}</span>
        )}
        {relatedSkills.length > 0 &&
          relatedSkills.map(skill => (
            <div className={styles.skill} key={skill.Name}>
              <span
                className={classNames(styles.skillName, styles.relatedSkill)}
                onClick={this.onPlaySkillAudio(skill.Name, this.props.skinName)}
              >
                {this.props.translator.tr(skill.Name)}
              </span>
              <span
                className={styles.skillDescription}
                dangerouslySetInnerHTML={{ __html: this.props.translator.tr(skill.Description) }}
              />
            </div>
          ))}
      </div>
    );
  }
}
