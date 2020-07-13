import chalk from 'chalk';
import { Flavor } from 'core/shares/types/host_config';
import { TranslationModule } from 'core/translations/translation_module';

export class Logger {
  private translator: TranslationModule | undefined;
  constructor(private mode: Flavor = Flavor.Dev) {}

  public set Translator(translator: TranslationModule) {
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
    console.info(chalk.blueBright(...this.translate(args)));
  }

  error(...args: any[]) {
    // tslint:disable-next-line: no-console
    console.error(chalk.redBright(...this.translate(args)));
  }

  debug(...args: any[]) {
    if (this.mode !== Flavor.Prod) {
      // tslint:disable-next-line: no-console
      console.log(chalk.green(...this.translate(args)));
    }
  }

  async dump() {
    process.stdin.setRawMode && process.stdin.setRawMode(true);
    return new Promise(resolve => {
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
