const translationObjectSign = '@@translate:';

export type PatchedTranslationObject = {
  original: string;
  params: string[];
};

type TranslationPackPatchedObject = PatchedTranslationObject & {
  tag: typeof translationObjectSign;
};

type TranslationsDictionary = {
  [k: string]: string;
};

export class TranslationPack {
  private constructor(private translationJon: PatchedTranslationObject) {}

  updateRawText(newText: string) {
    this.translationJon.original = newText;
    return this;
  }

  updateParams(newParams: string[]) {
    this.translationJon.params = newParams;
    return this;
  }

  extract() {
    return this.translationJon;
  }

  toString() {
    return JSON.stringify(this.translationJon);
  }

  public static translationJsonPatcher(
    originalText: string,
    ...stringParams: string[]
  ) {
    const translationJson: TranslationPackPatchedObject = {
      tag: translationObjectSign,
      original: originalText,
      params: stringParams,
    };

    return new TranslationPack(translationJson);
  }

  public static translationJsonDispatcher(
    wrappedString: string,
    translationsDictionary: TranslationsDictionary,
  ) {
    try {
      const translateObject: TranslationPackPatchedObject = JSON.parse(
        wrappedString,
      );
      if (!translateObject.tag || translateObject.tag !== translationObjectSign) {
        return wrappedString;
      }

      let target = translationsDictionary[translateObject.original];

      if (target === undefined) {
        // tslint:disable-next-line: no-console
        console.warn(`Translations Warning - Missing translation: ${target}`);
        return wrappedString;
      }

      if (translateObject.params.length > 0) {
        for (let i = 0; i < translateObject.params.length; i++) {
          target = target.replace(
            new RegExp(`/\{${i}\}/`, 'g'),
            translateObject.params[i],
          );
        }
      }

      return target;
    } catch {
      return wrappedString;
    }
  }
}
