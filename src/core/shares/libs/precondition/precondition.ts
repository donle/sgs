import { Flavor } from 'core/shares/types/host_config';

export class Precondition {
  public static alarm<T>(arg: T | null | undefined, errorMsg: string): T {
    if (arg === null || arg === undefined) {
      // tslint:disable-next-line:no-console
      console.warn(errorMsg);
    }

    return arg!;
  }

  public static exists<T>(arg: T | null | undefined, errorMsg: string): T {
    if (arg === null || arg === undefined) {
      throw new Error(errorMsg);
    }

    return arg;
  }

  public static assert(success: boolean, errorMsg: string) {
    if (!success) {
      throw new Error('Assertion failed: ' + errorMsg);
    }
  }

  public static UnreachableError(arg: never) {
    return new Error(`Unreachable error in switch case of argument ${arg}`);
  }

  public static debugBlock(flavor: Flavor, debugExec: () => void | Promise<void>) {
    if (flavor === Flavor.Dev) {
      debugExec();
    }
  }
}
