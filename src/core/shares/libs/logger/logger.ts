import chalk from 'chalk';
import { Flavor } from 'core/shares/types/host_config';
import { TranslationModule } from 'core/translations/translation_module';

export abstract class Logger {
  protected translator: TranslationModule | undefined;
  constructor(protected mode: Flavor = Flavor.Dev) {}

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

  abstract info(...args: any[]): void;

  abstract error(...args: any[]): void;

  abstract debug(...args: any[]): void;

  abstract dump(): Promise<void>;
}
