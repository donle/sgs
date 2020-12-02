import type { IpcRenderer } from 'electron';
import { FLASH_WINDOW, SET_DATA } from 'electron.port';
import { ElectronLoader } from './electron_loader';

export class ProdElectronLoader extends ElectronLoader {
  private ipcRenderer: IpcRenderer = (window as any).ipcRenderer;

  public flashFrame() {
    this.ipcRenderer.send(FLASH_WINDOW);
  }

  public setData<T>(key: string, value: T) {
    this.ipcRenderer.send(SET_DATA, value);
  };
}
