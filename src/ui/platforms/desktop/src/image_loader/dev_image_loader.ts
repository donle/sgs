import { ImageLoader } from './image_loader';

export class DevImageLoader implements ImageLoader {
  public getCardImage(name: string) {
    return {
      alt: name,
    };
  }

  public getCharacterImage(name: string) {
    return {
      alt: name,
    };
  }
}
