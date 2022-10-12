import { Logger } from './logger';
import chalk from 'chalk';
import { Flavor } from 'core/shares/types/host_config';

export class ServerLogger extends Logger {
  private readonly logFileDir = './backlog.txt';
  private fileStreamLoader: any | undefined;

  translate(args: any[]) {
    if (this.translator) {
      return args.map(arg => (typeof arg === 'string' ? this.translator!.tr(arg) : arg));
    }

    return args;
  }

  info(...args: any[]) {
    // tslint:disable-next-line: no-console
    console.info(chalk.blueBright(...this.translate(args)));
  }

  error(...args: any[]) {
    // tslint:disable-next-line: no-console
    console.error(chalk.redBright(...this.translate(args)));

    if (this.mode === Flavor.Prod && typeof window === 'undefined') {
      if (this.fileStreamLoader === undefined) {
        this.fileStreamLoader = import('fs');
      }

      this.fileStreamLoader.then(fs => {
        if (!fs.existsSync(this.logFileDir)) {
          fs.writeFileSync(this.logFileDir, `[${new Date().toISOString()}]: ${JSON.stringify(args)}\n`);
        } else {
          fs.appendFileSync(this.logFileDir, `[${new Date().toISOString()}]: ${JSON.stringify(args)}\n`);
        }
      });
    }
  }

  debug(...args: any[]) {
    if (this.mode !== Flavor.Prod) {
      // tslint:disable-next-line: no-console
      console.log(chalk.green(...this.translate(args)));
    }
  }

  async dump() {
    process.stdin.setRawMode && process.stdin.setRawMode(true);
    return new Promise<void>(resolve => {
      process.stdin.resume();
      process.stdin.once('data', data => {
        process.stdin.setRawMode && process.stdin.setRawMode(false);
        const command = data.toString().trim();
        if (command === 'c') {
          process.exit();
        } else if (command === 'g') {
          process.stdin.pause();
        }
        resolve();
      });
    });
  }
}
