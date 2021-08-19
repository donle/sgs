import { Flavor } from 'core/shares/types/host_config';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { Logger } from './logger';

export class ClientLogger extends Logger {
  protected translator: ClientTranslationModule | undefined;
  constructor(private flavor: Flavor = Flavor.Prod) {
    super();
  }

  public set Translator(translator: ClientTranslationModule) {
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

  // tslint:disable-next-line: no-empty
  async dump() {}
}
