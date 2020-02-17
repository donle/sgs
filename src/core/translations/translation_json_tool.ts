import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';

export const enum Languages {
  ZH_CN = 'zh_cn',
  EN_AU = 'en_au',
}

const translationObjectSign = '@@translate:';

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
  private constructor(private readonly dictionary?: TranslationDictionary) {}

  public static setup(dictionary?: TranslationDictionary) {
    return new Translation(dictionary);
  }

  public tr(rawText: string) {
    if (this.dictionary && this.dictionary[rawText]) {
      return this.dictionary[rawText];
    }

    return rawText;
  }
}

export class TranslationPack {
  private constructor(private translationJon: PatchedTranslationObject) {}

  private static emojiOrImageTextDict: EmojiOrImageTranslationDictionary = {};

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

  public static patchCardInTranslation(cardId: CardId) {
    const card = Sanguosha.getCardById(cardId);
    return `${TranslationPack.patchEmojiOrImageInTranslation(card.Suit)} ${
      card.CardNumber
    } ${card.Name}`;
  }

  public static patchEmojiOrImageInTranslation(rawText: string | number) {
    return translationObjectSign + rawText;
  }

  public addEmojiOrImageSymbolText(
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
          target = target.replace(
            new RegExp(`/{${i}}/`, 'g'),
            translateObject.params[i].toString(),
          );
        }
      }
      for (const [rawText, path] of Object.entries(
        TranslationPack.emojiOrImageTextDict,
      )) {
        target.replace(rawText, path);
      }
      return target;
    } catch {
      return wrappedString;
    }
  }
}
