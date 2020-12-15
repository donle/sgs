import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { IpcRenderer } from 'electron';
import {
  DELETE_DATA,
  FLASH_WINDOW,
  GAME_EVENT_FLOW,
  GET_ALL_DATA,
  READ_REPLAY,
  SAVE_REPLAY,
  SET_DATA,
} from 'electron.port';
import { ReplayDataType } from 'types/replay_props';
import { ElectronLoader } from './electron_loader';

export class ProdElectronLoader extends ElectronLoader {
  private saveJson: any = {};
  private tempSaveData: any = {};
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

  public saveTemporaryData(key: string, value: string): void {
    this.tempSaveData[key] = value;
  }
  public getTemporaryData(key: string): string | null {
    return this.tempSaveData[key];
  }

  public sendReplayEventFlow(
    event: ServerEventFinder<GameEventIdentifiers>,
    otherInfo: Pick<ReplayDataType, Exclude<keyof ReplayDataType, 'events'>>,
  ): void {
    this.ipcRenderer.send(GAME_EVENT_FLOW, event, otherInfo);
  }

  public async saveReplay(): Promise<void> {
    this.ipcRenderer.send(SAVE_REPLAY);
  }

  public async readReplay(version: string): Promise<ReplayDataType | undefined> {
    return new Promise<ReplayDataType | undefined>(resovle => {
      this.ipcRenderer.send(READ_REPLAY, version);
      this.ipcRenderer.on(READ_REPLAY, (event, saveData: ReplayDataType | undefined) => {
        resovle(saveData);
      });
    });
  }

  public get ReplayEnabled(): boolean {
    return true;
  }
}
