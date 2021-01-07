import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ClientFlavor } from 'props/config_props';
import { DevElectronLoader } from './dev_electron_loader';
import { ElectronLoader } from './electron_loader';
import { FakeElectronLoader } from './fake_electron_loader';

export async function getElectronLoader(flavor: ClientFlavor): Promise<ElectronLoader> {
  switch (flavor) {
    case ClientFlavor.Dev:
      return new FakeElectronLoader();
    case ClientFlavor.Web:
      return new DevElectronLoader();
    case ClientFlavor.Desktop:
      const { ProdElectronLoader } = await import('./prod_electron_loader');
      return new ProdElectronLoader();
    default:
      throw Precondition.UnreachableError(flavor);
  }
}
