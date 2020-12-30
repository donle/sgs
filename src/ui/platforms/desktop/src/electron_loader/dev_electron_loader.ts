import { ReplayDataType } from 'types/replay_props';
import { ElectronLoader } from './electron_loader';

export class DevElectronLoader extends ElectronLoader {
  // tslint:disable-next-line:no-empty
  public flashFrame() {}

  public setData<T>(key: string, value: T) {
    window.localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : (value as any));
  }

  public getData(key: string) {
    return window.localStorage.getItem(key) as any;
  }

  public removeData(key: string) {
    return window.localStorage.removeItem(key);
  }

  public saveTemporaryData(key: string, value: string): void {
    window.sessionStorage.setItem(key, value);
  }
  public getTemporaryData(key: string): string | null {
    return window.sessionStorage.getItem(key);
  }

  // tslint:disable-next-line:no-empty
  public refreshReplayDataFlow() {}
  // tslint:disable-next-line:no-empty
  public sendReplayEventFlow(): void {}
  // tslint:disable-next-line:no-empty
  public async saveReplay(): Promise<void> {}
  public async readReplay(): Promise<ReplayDataType | undefined> {
    return;
  }
  public get ReplayEnabled(): boolean {
    return false;
  }
  // tslint:disable-next-line:no-empty
  public whenUpdate() {}
}
