import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { ReplayDataType } from 'types/replay_props';

export abstract class ElectronLoader {
  public abstract flashFrame(): void;
  public abstract setData<T>(key: string, value: T): void;
  public abstract getData<T>(key: string): T;
  public abstract removeData(key: string): void;
  public abstract saveTemporaryData(key: string, value: string): void;
  public abstract getTemporaryData(key: string): string | null;
  public abstract sendReplayEventFlow(
    event: ServerEventFinder<GameEventIdentifiers>,
    otherInfo?: Pick<ReplayDataType, Exclude<keyof ReplayDataType, 'events'>>,
  ): void;
  public abstract saveReplay(): Promise<void>;
  public abstract async readReplay(version: string): Promise<ReplayDataType | undefined>;
  public abstract get ReplayEnabled(): boolean;
  public abstract refreshReplayDataFlow(): void;
  public abstract whenUpdate(updateCallback: (nextVersion: string, progress: number, complete?: boolean) => void): void;
}
