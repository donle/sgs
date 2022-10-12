import { ElectronData } from './electron_data';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import MarkDown from 'markdown-it';
import { ReplayDataType } from 'types/replay_props';

export abstract class ElectronLoader {
  public abstract flashFrame(): void;
  public abstract setData<T>(key: ElectronData, value: T): void;
  public abstract getData<T>(key: ElectronData): T;
  public abstract removeData(key: ElectronData): void;
  public abstract saveTemporaryData(key: ElectronData, value: string): void;
  public abstract getTemporaryData(key: ElectronData): string | null;
  public abstract sendReplayEventFlow(
    event: ServerEventFinder<GameEventIdentifiers>,
    otherInfo?: Pick<ReplayDataType, Exclude<keyof ReplayDataType, 'events'>>,
  ): void;
  public abstract saveReplay(): Promise<void>;
  public abstract readReplay(version: string): Promise<ReplayDataType | undefined>;
  public abstract get ReplayEnabled(): boolean;
  public abstract refreshReplayDataFlow(): void;
  public abstract whenUpdate(
    updateCallback: (
      nextVersion: string,
      progress: number,
      totalFiles: number,
      complete?: boolean,
      downloadingFile?: number,
    ) => void,
  ): void;

  public async getGameLog() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://gitee.com/api/v5/repos/doublebit/PicTest/releases/latest');
    xhr.responseType = 'json';
    xhr.send();
    return new Promise<string>(resolve => {
      xhr.onload = function () {
        const response = xhr.response;
        const markdown = new MarkDown();
        resolve(markdown.render(response.body));
      };
    });
  }
}
