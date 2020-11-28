import type { IpcRenderer } from 'electron';
import { FLASH_WINDOW } from 'electron.port';
import { ElectronLoader } from './electron_loader';

export class ProdElectronLoader extends ElectronLoader {
  private ipcRenderer: IpcRenderer = (window as any).ipcRenderer;

  public flashFrame() {
    this.ipcRenderer.send(FLASH_WINDOW);
  }
}
