import { DevElectronLoader } from './dev_electron_loader';

export class FakeElectronLoader extends DevElectronLoader {
  // tslint:disable-next-line: no-empty
  public async getGameLog() {
    return '';
  }
}
