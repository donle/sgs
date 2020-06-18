import { ImageLoader } from './image_loader';

export class DevImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    return {
      alt: name,
    };
  }

  public async getCharacterImage(name: string) {
    return {
      alt: name,
    };
  }

  public async getCardBack() {
    return { alt: 'New QSanguosha' };
  }
}
