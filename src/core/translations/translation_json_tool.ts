import { CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';

export const enum Languages {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}

export type PatchedTranslationObject = {
  original: string;
  params: (string | number)[];
};

export type TranslationPackPatchedObject = PatchedTranslationObject & {
  tag: typeof TranslationPack.translationObjectSign;
};

export type TranslationsDictionary = {
  [k: string]: string;
};

type EmojiOrImageTranslationDictionary = {
  [k: string]: string;
};

export type TranslatedCardObject = {
  suitImageUrl: string;
  cardNumber: string;
  cardName: string;
};

export class TranslationPack {
  private constructor(private translationJon: PatchedTranslationObject) {}
  private static emojiOrImageTextDict: EmojiOrImageTranslationDictionary = {};
  public static readonly translationObjectSign = '@@translate:';
  public static readonly translateCardObjectSign =
    TranslationPack.translationObjectSign + 'card:';
  public static readonly translateTextArraySign =
    TranslationPack.translationObjectSign + 'array:';

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
    return (
      TranslationPack.translationObjectSign +
      JSON.stringify(this.translationJon)
    );
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

  public static patchCardInTranslation(...cardIds: CardId[]) {
    return (
      TranslationPack.translateCardObjectSign +
      JSON.stringify(
        cardIds.map(cardId => {
          const card = Sanguosha.getCardById(cardId);
          return `${TranslationPack.patchEmojiOrImageInTranslation(
            card.Suit,
          )} ${card.CardNumber} ${card.Name}`;
        }),
      )
    );
  }

  public static isCardObjectText(text: string) {
    return text.startsWith(TranslationPack.translateCardObjectSign);
  }

  public static isTextArrayText(text: string) {
    return text.startsWith(TranslationPack.translateTextArraySign);
  }

  public static translatePatchedCardText(
    text: string,
    dictionary: TranslationsDictionary,
  ): TranslatedCardObject[] {
    const cardObjects: TranslatedCardObject[] = [];
    const cardTextArray: string[] = JSON.parse(
      text.slice(TranslationPack.translateCardObjectSign.length),
    );

    for (const cardText of cardTextArray) {
      const [cardSuitString, cardNumber, cardName] = cardText.split(' ');
      cardObjects.push({
        suitImageUrl: TranslationPack.emojiOrImageTextDict[cardSuitString],
        cardNumber,
        cardName: dictionary[cardName] || cardName,
      });
    }

    return cardObjects;
  }

  public static patchEmojiOrImageInTranslation(rawText: string | number) {
    return TranslationPack.translateCardObjectSign + rawText;
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

  public static dispatch(wrappedString: string) {
    try {
      const translateObject: TranslationPackPatchedObject = JSON.parse(
        wrappedString.slice(TranslationPack.translationObjectSign.length),
      );
      if (
        !translateObject.tag ||
        translateObject.tag !== TranslationPack.translationObjectSign
      ) {
        return;
      }

      return translateObject;
    } catch {
      return;
    }
  }

  public static wrapArrayParams(...params: string[]) {
    return TranslationPack.translateTextArraySign + params.join(',');
  }

  public static translationJsonPatcher(
    originalText: string,
    ...stringParams: (string | number)[]
  ) {
    const translationJson: TranslationPackPatchedObject = {
      tag: TranslationPack.translationObjectSign,
      original: originalText,
      params: stringParams,
    };

    return new TranslationPack(translationJson);
  }

  public static translationJsonDispatcher(
    wrappedString: string,
    translationsDictionary: TranslationsDictionary,
  ) {
    const dispatchedTranslationObject = this.dispatch(wrappedString);
    if (dispatchedTranslationObject === undefined) {
      return wrappedString;
    }

    let target = translationsDictionary[dispatchedTranslationObject.original];

    if (target === undefined) {
      // tslint:disable-next-line: no-console
      console.warn(`Translations Warning - Missing translation: ${target}`);
      return wrappedString;
    }

    if (dispatchedTranslationObject.params.length > 0) {
      for (let i = 0; i < dispatchedTranslationObject.params.length; i++) {
        const param = dispatchedTranslationObject.params[i].toString();
        let parsedParam = param;
        if (TranslationPack.isTextArrayText(param)) {
          parsedParam = param
            .slice(TranslationPack.translateTextArraySign.length)
            .split(',')
            .map(subParam => translationsDictionary[subParam] || subParam)
            .join(',');
        } else {
          parsedParam = translationsDictionary[param] || param;
        }

        target = target.replace(new RegExp(`\\{${i}\\}`, 'g'), parsedParam);
      }
    }

    return target;
  }
}
