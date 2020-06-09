import { ImageProps } from 'props/image_props';

export interface ImageLoader {
  getCardImage(name: string): ImageProps;
  getCharacterImage(name: string): ImageProps;
}
