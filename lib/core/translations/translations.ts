export const enum Languages {
  ZH_CN = 'zh_cn',
}

export type TranslationMap = {
  [OriginalString: string]: string;
};

export class Translations {
  private static translationsMap: Map<string, string> | undefined;
  private constructor() {}

  static tr(source: string, ...params: string[]) {
    if (!Translations.translationsMap) {
      throw new Error('Translation language is not initialized yet');
    }

    let target = Translations.translationsMap.get(source) || source;

    if (params.length > 0) {
      for (let i = 0; i < params.length; i++) {
        target = target.replace(new RegExp(`/\{${i}\}/`, 'g'), params[i]);
      }
    }
  }

  static async setupLanguage(language: Languages) {
    const { translations }: { translations: TranslationMap } = await import(`./${language}.ts`);
    Translations.translationsMap = new Map(Object.entries(translations));
  }
}
