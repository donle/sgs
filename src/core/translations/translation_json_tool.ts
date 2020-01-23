const translationJsonOffset = '@@translate:';

type PatchedTranslationObject = {
  original: string;
  params: string[];
};

type TranslationsDictionary = {
  [k: string]: string;
};

export function translationJsonPather(
  originalText: string,
  ...stringParams: string[]
) {
  const translationJson: PatchedTranslationObject = {
    original: originalText,
    params: stringParams,
  };

  return translationJsonOffset + JSON.stringify(translationJson);
}

export function translationJsonDispatcher(
  wrappedString: string,
  translationsDictionary: TranslationsDictionary,
) {
  if (wrappedString.startsWith(translationJsonOffset)) {
    const translateObject: PatchedTranslationObject = JSON.parse(
      wrappedString.slice(translationJsonOffset.length),
    );
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
  }

  return wrappedString;
}
