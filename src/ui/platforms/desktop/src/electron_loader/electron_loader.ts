export abstract class ElectronLoader {
  public abstract flashFrame(): void;
  public abstract setData<T>(key: string, value: T): void;
  public abstract getData<T>(key: string): T;
  public abstract removeData(key: string): void;
  public abstract saveTemporaryData(key: string, value: string): void;
  public abstract getTemporaryData(key: string): string | null;
}
