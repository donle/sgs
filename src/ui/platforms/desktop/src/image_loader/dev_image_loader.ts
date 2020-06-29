import { PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { ImageLoader } from './image_loader';

const remoteRoot: string = 'http://doublebit.gitee.io/pictest/backup_remote';

export class DevImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    return {
      src: `${remoteRoot}/images/cards/${name}.webp`,
      alt: name,
    };
  }

  public async getCharacterImage(characterName: string) {
    return {
      src: `${remoteRoot}/images/characters/${characterName}.png`,
      alt: characterName,
    };
  }

  public getCardBack() {
    return { src: `${remoteRoot}/images/cards/cardback.webp`, alt: 'New QSanguosha' };
  }

  public async getPlayerRoleCard(roleName: PlayerRole) {
    return { src: `${remoteRoot}/images/system/death/${roleName}.png`, alt: Functional.getPlayerRoleRawText(roleName) };
  }
  public async getOthersEquipCard(cardName: string) {
    return { src: `${remoteRoot}/images/others_equips/${cardName}.png`, alt: cardName };
  }

  public getBackgroundImage() {
    return { alt: '' };
  }

  public getEmptySeatImage() {
    return { src: `${remoteRoot}/images/system/empty_seat.png`, alt: '' };
  }

  public getUnknownCharacterImage() {
    return { src: `${remoteRoot}/images/system/player_seat.png`, alt: '' };
  }

  public async getSlimEquipCard(cardName: string) {
    return { src: `${remoteRoot}/images/slim_equips/${cardName}.png`, alt: 'Slim Equip Card' };
  }

  public async getSlimCard(cardName: string) {
    return { src: `${remoteRoot}/images/slim_cards/${cardName}.png`, alt: 'Slim Card' };
  }

  public getCardNumberBgImage() {
    return { src: `${remoteRoot}/images/system/cardNumBg.png`, alt: '' };
  }

  public getTurnedOverCover() {
    return { src: `${remoteRoot}/images/system/turn_over.png`, alt: '' };
  }
}
