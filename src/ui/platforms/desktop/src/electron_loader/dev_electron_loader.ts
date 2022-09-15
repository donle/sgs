import { ReplayDataType } from 'types/replay_props';
import { ElectronData } from './electron_data';
import { ElectronLoader } from './electron_loader';

export class DevElectronLoader extends ElectronLoader {
  constructor() {
    super();
    if (!window.localStorage.getItem(ElectronData.Language)) {
      window.localStorage.setItem('language', navigator.language);
    }
  }
  // tslint:disable-next-line:no-empty
  public flashFrame() {}

  public setData<T>(key: ElectronData, value: T) {
    window.localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : (value as any));
  }

  public getData<T = unknown>(key: ElectronData): T {
    const data = window.localStorage.getItem(key);
    try {
      if (data) {
        return JSON.parse(data);
      } else {
        return (data as unknown) as T;
      }
    } catch {
      return (data as unknown) as T;
    }
  }

  public removeData(key: ElectronData) {
    return window.localStorage.removeItem(key);
  }

  public saveTemporaryData(key: ElectronData, value: string): void {
    window.sessionStorage.setItem(key, value);
  }
  public getTemporaryData(key: ElectronData): string | null {
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

  // tslint:disable-next-line:no-empty
  public async loadCustomScrtip(): Promise<string> {
    return Promise.resolve('');
  }
}
