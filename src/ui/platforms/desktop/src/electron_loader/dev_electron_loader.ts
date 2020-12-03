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
}
