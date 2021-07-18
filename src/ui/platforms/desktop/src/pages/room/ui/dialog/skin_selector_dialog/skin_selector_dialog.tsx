import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as mobxReact from 'mobx-react';
import * as React from 'react';
import { BaseDialog } from '../base_dialog';
import styles from './skin_selector_dialog.module.css';
import { CharacterSkinInfo } from 'skins/skins';
import { getSkinName } from '../../switch_avatar/switch_skin';
import { SkinCard } from 'ui/skin/skin';

type SkinSelectorDialogProps = {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  character: string;
  playerId: string;
  skinData: CharacterSkinInfo[];
  onClick?(skinName: string): void;
};

@mobxReact.observer
export class SkinSelectorDialog extends React.Component<SkinSelectorDialogProps> {
  @mobx.observable.shallow
  private selectedSkins: string[] = [];

  @mobx.action
  private readonly onClick = (skinName: string) => {
    this.props.onClick && this.props.onClick(skinName);
  };

  render() {
    const skinNameList = getSkinName(
      this.props.character,
      this.props.playerId,
      this.props.skinData,
    ).skinNameList.concat();
    if (!skinNameList.includes('random')) skinNameList.push('random');
    return (
      <BaseDialog title={this.props.translator.tr('please choose a skin')}>
        <div className={styles.innerDialog}>
          <div className={styles.characterSelector}>
            {skinNameList.map((skinName, index) => {
              return (
                <div className={styles.characterSelectorItem} key={index}>
                  <SkinCard
                    imageLoader={this.props.imageLoader}
                    skinData={this.props.skinData}
                    translator={this.props.translator}
                    character={this.props.character}
                    skinName={skinName}
                    playerId={this.props.playerId}
                    key={skinName}
                    onClick={this.onClick}
                    size={'small'}
                    selected={this.selectedSkins.includes(skinName)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </BaseDialog>
    );
  }
}
