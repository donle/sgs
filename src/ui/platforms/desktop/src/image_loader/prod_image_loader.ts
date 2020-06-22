import { PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import backgroundImage from './images/system/background.jpg';
import unknownCharacterImage from './images/system/empty_seat.png';
import { ImageLoader } from './image_loader';

export class ProdImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    const image: string = (await import(`./images/cards/${name}.webp`)).default;
    return {
      alt: name,
      src: image,
    };
  }

  public async getCardBack() {
    const image: string = (await import('./images/cards/cardback.webp')).default;
    return { alt: 'New QSanguosha', src: image };
  }

  public getBackgroundImage() {
    return { src: backgroundImage, alt: '' };
  }

  public getUnknownCharacterImage() {
    return { src: unknownCharacterImage, alt: '' };
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
