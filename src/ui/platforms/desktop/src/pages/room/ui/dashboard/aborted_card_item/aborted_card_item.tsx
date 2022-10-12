import styles from './aborted_card_item.module.css';
import itemStyles from '../equip_card_item/equip_card_item.module.css';
import classNames from 'classnames';
import { CharacterEquipSections } from 'core/characters/character';
import { ImageLoader } from 'image_loader/image_loader';
import { ImageProps } from 'props/image_props';
import * as React from 'react';
import { Picture } from 'ui/picture/picture';

type AbortedCardItemProps = {
  imageLoader: ImageLoader;
  abortedSection: CharacterEquipSections;
};

export class AbortedCardItem extends React.Component<AbortedCardItemProps> {
  private sectionImage: ImageProps | undefined;

  async componentDidMount() {
    this.sectionImage = await this.props.imageLoader.getSlimAbortedEquipSection(this.props.abortedSection);
  }

  render() {
    return (
      <div
        className={classNames(styles.abortedCardItem, itemStyles.equipCardItem, {
          [itemStyles.weapon]: this.props.abortedSection === CharacterEquipSections.Weapon,
          [itemStyles.armor]: this.props.abortedSection === CharacterEquipSections.Shield,
          [itemStyles.defenseRide]: this.props.abortedSection === CharacterEquipSections.DefenseRide,
          [itemStyles.offenseRide]: this.props.abortedSection === CharacterEquipSections.OffenseRide,
          [itemStyles.precious]: this.props.abortedSection === CharacterEquipSections.Precious,
        })}
      >
        {this.sectionImage && <Picture image={this.sectionImage} />}
      </div>
    );
  }
}
