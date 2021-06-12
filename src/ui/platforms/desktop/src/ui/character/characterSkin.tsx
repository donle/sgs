import classNames from 'classnames';
import { Character, getNationalityRawText } from 'core/characters/character';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { NationalityBadge } from '../badge/badge';
import { CharacterHp } from '../hp/hp';
import styles from './character.module.css';
import { gameSkinInfo } from 'image_loader/skin_data';

export type CharacterSkinCardProps = {
  character: Character;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  onClick?(character: Character): void;
  disabled?: boolean;
  className?: string;
  size?: 'regular' | 'small';
  selected?: boolean;
};

@mobxReact.observer
export class CharacterSkinCard extends React.Component<CharacterSkinCardProps> {
  private skinNameList: string[] = [];
  private skinNameLists: string[] = [];
  private skinCharacterList: string[] = [];
  @mobx.observable.ref
  private characterImage: string | undefined;
  @mobx.observable.ref
  private characterSkinImageL: string | undefined;
  @mobx.observable.ref
  private characterSkinImageR: string | undefined;
  private posX: number;

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
  };

  private getOffset(el: Element) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
    };
  }

  getskinNameList() {
    this.skinNameList.push(this.props.character.Name);
    if (this.skinCharacterList.includes(this.props.character.Name)) {
      const index: number = this.skinCharacterList.indexOf(this.props.character.Name);
      const characterSkinInfo = gameSkinInfo[index];
      for (const skinInfo of characterSkinInfo.skinInfo) {
        if (skinInfo.skinName) {
          this.skinNameList.push(skinInfo.skinName);
        }
      }
    }
    this.skinNameLists = this.skinNameList;
    return this.skinNameLists;
  }

  nextSkin() {
    let next: string | undefined;
    next = this.skinNameLists.shift();
    if (next) {
      this.skinNameLists.push(next);
    }
    this.getSkinImage();
  }

  preSkin() {
    let p: string | undefined;
    p = this.skinNameLists.pop();
    if (p) {
      this.skinNameLists.unshift(p);
    }
    this.getSkinImage();
  }

  @mobx.action
  async getSkinImage() {
    this.characterImage = (
      await this.props.imageLoader.getCharacterSkinPlay(this.props.character.Name, this.skinNameLists[0])
    ).src;

    if (this.skinNameLists.length > 1) {
      this.characterSkinImageL = (
        await this.props.imageLoader.getCharacterSkinPlay(
          this.props.character.Name,
          this.skinNameLists[this.skinNameLists.length - 1],
        )
      ).src;
    } else {
      this.characterSkinImageL = 'image';
    }

    this.characterSkinImageR = (
      await this.props.imageLoader.getCharacterSkinPlay(this.props.character.Name, this.skinNameLists[1])
    ).src;
  }

  @mobx.action
  async componentDidMount() {
    for (const characterSkinInfo of gameSkinInfo) {
      this.skinCharacterList.push(characterSkinInfo.characterName);
    }
    this.skinNameList = [];
    this.getskinNameList();
    this.getSkinImage();
  }
  @mobx.action
  async componentDidUpdate() {
    this.skinNameList = [];
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
              <CharacterHp
                character={character}
                className={classNames(styles.characterHp, {
                  [styles.small]: size === 'small',
                })}
              />

              <img
                className={classNames(styles.characterImage, { [styles.small]: size === 'small' }, styles.right)}
                src={this.characterSkinImageR}
                alt=""
              />
              <img
                className={classNames(styles.characterImage, { [styles.small]: size === 'small' }, styles.left)}
                src={this.characterSkinImageL}
                alt=""
                onClick={this.onClick}
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
