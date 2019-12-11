import { Languages, translations } from './languages';

export type TranslationMap = {
  [OriginalString: string]: string;
};

export function translate(source: string, ...params: string[]) {
  return new TranslationInstace(source, params);
}

export function translateNote(source: string, ...params: string[]) {
  return (language: Languages) => translate(source, ...params.map(param => translate(param).to(language))).to(language);
}

class TranslationInstace {
  constructor(
    private translationSource: string,
    private translationParams: string[],
  ) {}
  public to(language: Languages): string {
    const tr = translations(language);
    let target = tr[this.translationSource];

    if (target === undefined) {
      // tslint:disable-next-line: no-console
      console.warn(`Translations Warning - Missing translation: ${target}`);
      target = this.translationSource;
    }

    if (this.translationParams.length > 0) {
      for (let i = 0; i < this.translationParams.length; i++) {
        target = target.replace(
          new RegExp(`/\{${i}\}/`, 'g'),
          this.translationParams[i],
        );
      }
    }

    return target;
  }
}
