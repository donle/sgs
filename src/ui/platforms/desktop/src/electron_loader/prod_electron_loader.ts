import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import type { IpcRenderer } from 'electron';
import {
  DELETE_DATA,
  DO_UPDATE,
  FLASH_WINDOW,
  GAME_EVENT_FLOW,
  GAME_EVENT_FLOW_REFRESH,
  GET_ALL_DATA,
  READ_REPLAY,
  REQUEST_CORE_VERSION,
  SAVE_REPLAY,
  SET_DATA,
} from 'electron.port';
import { ReplayDataType } from 'types/replay_props';
import { ElectronLoader } from './electron_loader';

export class ProdElectronLoader extends ElectronLoader {
  private saveJson: any = {};
  private tempSaveData: any = {};
  private ipcRenderer: IpcRenderer = (window as any).ipcRenderer;
  private whenUpdateallbackFn: Function | undefined;
  private updateTo: string | undefined;
  private updateProgress: number = 0;
  private updateComplete: boolean = false;

  constructor() {
    super();
    this.ipcRenderer.send(GET_ALL_DATA);
    this.ipcRenderer.on(GET_ALL_DATA, (event, data: any) => {
      this.saveJson = data;
    });
    this.ipcRenderer.on(DO_UPDATE, (evt, process: { nextVersion: string; progress: number; complete?: boolean }) => {
      if (this.whenUpdateallbackFn) {
        this.whenUpdateallbackFn(process.nextVersion, process.progress, process.complete);
      } else {
        this.updateTo = process.nextVersion;
        this.updateComplete = !!process.complete;
        this.updateProgress = process.progress;
      }
    });
    this.ipcRenderer.on(REQUEST_CORE_VERSION, () => {
      this.ipcRenderer.send(REQUEST_CORE_VERSION, Sanguosha.PlainVersion);
    });
  }

  public readonly whenUpdate = (
    updateCallback: (nextVersion: string, progress: number, complete?: boolean) => void,
  ) => {
    this.whenUpdateallbackFn = updateCallback;
    this.updateTo && updateCallback(this.updateTo, this.updateProgress, this.updateComplete);
  };

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

  public refreshReplayDataFlow() {
    this.ipcRenderer.send(GAME_EVENT_FLOW_REFRESH);
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
