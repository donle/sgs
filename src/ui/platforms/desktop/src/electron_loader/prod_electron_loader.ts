import type { IpcRenderer } from 'electron';
import { DELETE_DATA, FLASH_WINDOW, GET_ALL_DATA, SET_DATA } from 'electron.port';
import { ElectronLoader } from './electron_loader';

export class ProdElectronLoader extends ElectronLoader {
  private saveJson: any = {};
  private ipcRenderer: IpcRenderer = (window as any).ipcRenderer;

  constructor() {
    super();
    this.ipcRenderer.send(GET_ALL_DATA);
    this.ipcRenderer.on(GET_ALL_DATA, (event, data: any) => {
      this.saveJson = data;
    });
  }

  public flashFrame() {
    this.ipcRenderer.send(FLASH_WINDOW);
  }

  public setData<T>(key: string, value: T) {
    this.ipcRenderer.send(SET_DATA, { key, value });
    this.saveJson[key] = value;
  }

  public getData<T>(key: string): T {
    return this.saveJson[key];
  }

  public removeData(key: string) {
    this.ipcRenderer.send(DELETE_DATA, key);
    delete this.saveJson[key];
  }
}
