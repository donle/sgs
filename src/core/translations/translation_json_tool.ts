import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';

export const enum Languages {
  ZH_CN = 'zh_cn',
  EN_AU = 'en_au',
}

const translationObjectSign = '@@translate:';
const translateCardObjectSign = translationObjectSign + 'card:';

export type PatchedTranslationObject = {
  original: string;
  params: (string | number)[];
};

type TranslationPackPatchedObject = PatchedTranslationObject & {
  tag: typeof translationObjectSign;
};

type TranslationsDictionary = {
  [k: string]: string;
};

type EmojiOrImageTranslationDictionary = {
  [k: string]: string;
};

type TranslationDictionary = {
  [K: string]: string;
};

export class Translation {
  private readonly dictionary: Map<
    Languages,
    TranslationDictionary
  > = new Map();
  private currentLanguage: Languages;
  private constructor(...dictionaries: [Languages, TranslationDictionary][]) {
    for (const subDictionary of dictionaries) {
      this.dictionary.set(subDictionary[0], subDictionary[1]);
    }
  }

  public static setup(
    currentLanguage: Languages,
    ...dictionaries: [Languages, TranslationDictionary][]
  ) {
    const translator = new Translation(...dictionaries);
    translator.currentLanguage = currentLanguage;

    return translator;
  }

  public tr(rawText: string | PatchedTranslationObject) {
    if (typeof rawText === 'object') {
      if (
        (rawText as TranslationPackPatchedObject).tag !== translationObjectSign
      ) {
        throw new Error(
          `Unexpected translation object: ${JSON.stringify(rawText)}`,
        );
      }

      const dict = this.dictionary.get(this.currentLanguage);
      return dict
        ? TranslationPack.create(rawText).translateTo(dict)
        : rawText.original;
    } else if (rawText.startsWith(translationObjectSign)) {
      const dict = this.dictionary.get(this.currentLanguage);

      return dict
        ? TranslationPack.translationJsonDispatcher(
            rawText.slice(translationObjectSign.length),
            dict,
          )
        : rawText.slice(translationObjectSign.length);
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

export class TranslationPack {
  private constructor(private translationJon: PatchedTranslationObject) {}
  private static emojiOrImageTextDict: EmojiOrImageTranslationDictionary = {};

  static create(translationJon: PatchedTranslationObject) {
    return new TranslationPack(translationJon);
  }

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
    return translationObjectSign + JSON.stringify(this.translationJon);
  }

  public translateTo(translationsDictionary: TranslationsDictionary) {
    let target = translationsDictionary[this.translationJon.original];

    if (target === undefined) {
      // tslint:disable-next-line: no-console
      console.warn(`Translations Warning - Missing translation: ${target}`);
      return this.translationJon.original;
    }

    if (this.translationJon.params.length > 0) {
      for (let i = 0; i < this.translationJon.params.length; i++) {
        const param = this.translationJon.params[i].toString();
        target = target.replace(
          new RegExp(`\\{${i}\\}`, 'g'),
          translationsDictionary[param] || param,
        );
      }
    }

    return target;
  }

  public static patchCardInTranslation(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return `${TranslationPack.patchEmojiOrImageInTranslation(card.Suit)} ${
      card.CardNumber
    } ${card.Name}`;
  }

  public static isCardObjectText(text: string) {
    return text.startsWith(translateCardObjectSign);
  }

  public static translatePatchedCardText(
    text: string,
    dictionary: TranslationsDictionary,
  ) {
    const [cardSuitString, cardNumber, cardName] = text.split(' ');

    return {
      suitImageUrl: TranslationPack.emojiOrImageTextDict[cardSuitString],
      cardNumber,
      cardName: dictionary[cardName] || cardName,
    };
  }

  public static patchEmojiOrImageInTranslation(rawText: string | number) {
    return translateCardObjectSign + rawText;
  }

  public static addEmojiOrImageSymbolText(
    ...symbolTextPair: [string | number, string][]
  ) {
    for (const [rawText, translatePath] of symbolTextPair) {
      TranslationPack.emojiOrImageTextDict[
        TranslationPack.patchEmojiOrImageInTranslation(rawText)
      ] = translatePath;
    }
  }

  public static translationJsonPatcher(
    originalText: string,
    ...stringParams: (string | number)[]
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
      if (
        !translateObject.tag ||
        translateObject.tag !== translationObjectSign
      ) {
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
          const param = translateObject.params[i].toString();
          target = target.replace(
            new RegExp(`\\{${i}\\}`, 'g'),
            translationsDictionary[param] || param,
          );
        }
      }
      //TODO: add emoji object in the return value;
      return target;
    } catch {
      return wrappedString;
    }
  }
}
