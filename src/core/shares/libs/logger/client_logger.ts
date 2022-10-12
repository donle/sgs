import { Flavor } from 'core/shares/types/host_config';
import { Logger } from './logger';

export class ClientLogger extends Logger {
  constructor(private flavor: Flavor = Flavor.Prod) {
    super();
  }

  info(...args: any[]) {
    // tslint:disable-next-line: no-console
    console.info(...args);
  }

  error(...args: any[]) {
    // tslint:disable-next-line: no-console
    console.error(...args);
  }

  debug(...args: any[]) {
    if (this.flavor !== Flavor.Prod) {
      // tslint:disable-next-line: no-console
      console.log(...args);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async dump() {}
}
