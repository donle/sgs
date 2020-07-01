import { PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { SkillType } from 'core/skills/skill';
import { ImageLoader } from './image_loader';
import { getSkillButtonImages } from './prod_button_image_loader';

import cardBackImage from './images/cards/cardback.webp';
import BingLiangCunDuanIcon from './images/delayed_tricks/bingliangcunduan.png';
import LeBuSiShuIcon from './images/delayed_tricks/lebusishu.png';
import LightningIcon from './images/delayed_tricks/lightning.png';
import backgroundImage from './images/system/background.jpg';
import cardNumberBg from './images/system/cardNumBg.png';
import chainImage from './images/system/chain.png';
import emptySeatImage from './images/system/empty_seat.png';
import unknownCharacterImage from './images/system/player_seat.png';
import turnedOverCoverImage from './images/system/turn_over.png';

export class ProdImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    const image: string = (await import(`./images/cards/${name}.webp`)).default;
    return {
      alt: name,
      src: image,
    };
  }

  public getCardBack() {
    return { alt: 'New QSanguosha', src: cardBackImage };
  }

  public getBackgroundImage() {
    return { src: backgroundImage, alt: '' };
  }

  getUnknownCharacterImage() {
    return { src: unknownCharacterImage, alt: '' };
  }
  public getEmptySeatImage() {
    return { src: emptySeatImage, alt: '' };
  }

  public getCardNumberBgImage() {
    return { src: cardNumberBg, alt: '' };
  }

  getTurnedOverCover() {
    return { src: turnedOverCoverImage, alt: '' };
  }

  public getChainImage() {
    return { alt: '', src: chainImage };
  }

  public getDelayedTricksImage(cardName: string) {
    if (cardName === 'lebusishu') {
      return { alt: cardName, src: LeBuSiShuIcon };
    }
    if (cardName === 'bingliangcunduan') {
      return { alt: cardName, src: BingLiangCunDuanIcon };
    }
    if (cardName === 'lightning') {
      return { alt: cardName, src: LightningIcon };
    }

    return { alt: cardName };
  }

  public getSkillButtonImage(skillType: SkillType, size: 'wide' | 'normal') {
    return getSkillButtonImages(skillType, size);
  }

  public async getOthersEquipCard(cardName: string) {
    const image: string = (await import(`./images/others_equips/${cardName}.png`)).default;
    return { alt: cardName, src: image };
  }

  public async getPlayerRoleCard(role: PlayerRole) {
    const roleName = Functional.getPlayerRoleRawText(role);
    const image: string = (await import(`./images/system/death/${roleName}.png`)).default;
    return { src: image, alt: roleName };
  }

  public async getSlimEquipCard(cardName: string) {
    const image: string = (await import(`./images/slim_equips/${cardName}.png`)).default;
    return { alt: 'Slim Equip Card', src: image };
  }

  public async getSlimCard(cardName: string) {
    const image: string = (await import(`./images/slim_cards/${cardName}.png`)).default;
    return { alt: 'Slim Card', src: image };
  }

  public async getCharacterImage(characterName: string) {
    const image: string = (await import(`./images/characters/${characterName}.png`)).default;
    return { alt: characterName, src: image };
  }
}
