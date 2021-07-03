import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import styles from './skin.module.css';
import { CharacterSkinInfo } from 'skins/skins';

export type SkinCardProps = {
  character: string;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  skinName: string;
  playerId: string;
  skinData: CharacterSkinInfo[];
  onClick?(skinName: string): void;
  disabled?: boolean;
  className?: string;
  size?: 'regular' | 'small';
  selected?: boolean;
};

@mobxReact.observer
export class SkinCard extends React.Component<SkinCardProps> {
  @mobx.observable.ref
  private skinImage: string | undefined;

  private readonly onClick = () => {
    if (!this.props.disabled) {
      this.props.onClick && this.props.onClick(this.props.skinName);
    }
  };

  @mobx.action
  async componentDidMount() {
    this.skinImage = (
      await this.props.imageLoader.getCharacterSkinPlay(
        this.props.character,
        this.props.skinData,
        this.props.playerId,
        this.props.skinName,
      )
    ).src;
  }

  @mobx.action
  async componentDidUpdate() {
    this.skinImage = (
      await this.props.imageLoader.getCharacterSkinPlay(
        this.props.character,
        this.props.skinData,
        this.props.playerId,
        this.props.skinName,
      )
    ).src;
  }

  render() {
    const { translator, className, size, selected } = this.props;
    return (
      <div
        className={classNames(styles.characterCard, className, {
          [styles.small]: size === 'small',
          [styles.selected]: selected,
        })}
        onClick={this.onClick}
      >
        {this.skinImage ? (
          <>
            <img
              className={classNames(styles.characterImage, { [styles.small]: size === 'small' })}
              src={this.skinImage}
              alt=""
            />
          </>
        ) : (
          <p>{translator.tr(this.props.skinName)}</p>
        )}
      </div>
    );
  }
}
