import chalk from 'chalk';
import { DevMode } from 'core/shares/types/host_config';
import { Translation } from 'core/translations/translation_json_tool';

export class Logger {
  private translator: Translation | undefined;
  constructor(private mode: DevMode = DevMode.Dev) {}

  public set Translator(translator: Translation) {
    this.translator = translator;
  }

  translate(args: any[]) {
    if (this.translator) {
      return args.map(arg => {
        return typeof arg === 'string' ? this.translator!.tr(arg) : arg;
      });
    }

    return args;
  }

  info(...args: any[]) {
    // tslint:disable-next-line: no-console
    console.info(chalk.blue(...this.translate(args)));
  }

  error(...args: any[]) {
    // tslint:disable-next-line: no-console
    console.error(chalk.redBright(...this.translate(args)));
  }

  debug(...args: any[]) {
    if (this.mode !== DevMode.Prod) {
      // tslint:disable-next-line: no-console
      console.log(chalk.green(...this.translate(args)));
    }
  }

  async dump() {
    process.stdin.setRawMode && process.stdin.setRawMode(true);
    return new Promise(resolve =>
      process.stdin.once('data', data => {
        process.stdin.setRawMode && process.stdin.setRawMode(false);
        if (data.toString().trim() === 'c') {
          process.exit();
        }
        resolve();
      }),
    );
  }
}
