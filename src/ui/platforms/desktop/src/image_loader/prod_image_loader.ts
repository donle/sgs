import { ImageLoader } from './image_loader';

//TODO: fillin prod image loader
export class ProdImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    const image: string = (await import(`./images/cards/${name}.webp`)).default;
    return {
      alt: name,
      src: image,
    };
  }

  public async getCharacterImage(name: string) {
    return {
      alt: name,
    };
  }

  public async getCardBack() {
    const image: string = (await import('./images/cards/cardback.webp')).default;
    return { alt: 'New QSanguosha', src: image };
  }
}
