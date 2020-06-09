import { ImageLoader } from './image_loader';

//TODO: fillin prod image loader
export class ProdImageLoader implements ImageLoader {
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
