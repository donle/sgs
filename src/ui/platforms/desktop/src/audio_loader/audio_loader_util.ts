import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ClientFlavor } from 'props/config_props';
import { DevAudioLoader } from './dev_audio_loader';
import { ProdAudioLoader } from './prod_audio_loader';

export function getAudioLoader(flavor: ClientFlavor) {
  switch (flavor) {
    case ClientFlavor.Web:
      return new DevAudioLoader();
    case ClientFlavor.Dev:
    case ClientFlavor.Desktop:
      return new ProdAudioLoader();
    default:
      throw Precondition.UnreachableError(flavor);
  }
}
