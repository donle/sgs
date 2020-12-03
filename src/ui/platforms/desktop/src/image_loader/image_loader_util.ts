import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ClientFlavor } from 'props/config_props';
import { DevImageLoader } from './dev_image_loader';
import { ImageLoader } from './image_loader';
import { ProdImageLoader } from './prod_image_loader';

export function getImageLoader(flavor: ClientFlavor): ImageLoader {
  switch (flavor) {
    case ClientFlavor.Web:
      return new DevImageLoader();
    case ClientFlavor.Dev:
    case ClientFlavor.Desktop:
      return new ProdImageLoader();
    default:
      throw Precondition.UnreachableError(flavor);
  }
}
