import { Precondition } from 'core/shares/libs/precondition/precondition';
import {
  Languages,
  PatchedTranslationObject,
  TranslationPack,
  TranslationPackPatchedObject,
  TranslationsDictionary,
} from './translation_json_tool';

export class TranslationModule {
  protected readonly dictionary: Map<Languages, TranslationsDictionary> = new Map();
  protected currentLanguage: Languages;
  protected constructor(...dictionaries: [Languages, TranslationsDictionary][]) {
    for (const subDictionary of dictionaries) {
      this.dictionary.set(subDictionary[0], subDictionary[1]);
    }
  }

  public static setup(currentLanguage: Languages, ...dictionaries: [Languages, TranslationsDictionary][]) {
    const translator = new TranslationModule(...dictionaries);
    translator.currentLanguage = currentLanguage;

    return translator;
  }

  public tr(rawText: string | PatchedTranslationObject) {
    if (typeof rawText === 'object') {
      Precondition.assert(
        (rawText as TranslationPackPatchedObject).tag === TranslationPack.translationObjectSign,
        `Unexpected translation object: ${JSON.stringify(rawText)}`,
      );

      const dict = this.dictionary.get(this.currentLanguage);
      return dict ? TranslationPack.create(rawText).translateTo(dict) : rawText.original;
    } else if (rawText.startsWith(TranslationPack.translationObjectSign)) {
      const dict = this.dictionary.get(this.currentLanguage);

      return dict
        ? TranslationPack.translationJsonDispatcher(rawText.slice(TranslationPack.translationObjectSign.length), dict)
        : rawText.slice(TranslationPack.translationObjectSign.length);
    } else {
      const targetDictionary = this.dictionary.get(this.currentLanguage);
      if (targetDictionary && targetDictionary[rawText]) {
        return targetDictionary[rawText];
      }

      return rawText;
    }
  }

  public set Language(lang: Languages) {
    this.currentLanguage = lang;
  }
}
