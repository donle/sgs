import { DevElectronLoader } from './dev_electron_loader';

export class FakeElectronLoader extends DevElectronLoader {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async getGameLog() {
    return '';
  }
}
