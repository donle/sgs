import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';

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

export class TranslationPack {
  private constructor(private translationJson: PatchedTranslationObject) {}
  public static readonly translationObjectSign = '@@translate:';
  public static readonly translateCardObjectSign = TranslationPack.translationObjectSign + 'card:';
  public static readonly translatePlayerObjectSign = TranslationPack.translationObjectSign + 'player:';
  public static readonly translateTextArraySign = TranslationPack.translationObjectSign + 'array:';
  public static readonly pureTextSign = '@@pure:';

  static create(translationJon: PatchedTranslationObject) {
    return new TranslationPack(translationJon);
  }

  updateRawText(newText: string) {
    this.translationJson.original = newText;
    return this;
  }

  updateParams(newParams: string[]) {
    this.translationJson.params = newParams;
    return this;
  }

  extract() {
    return this.translationJson;
  }

  toString() {
    return TranslationPack.translationObjectSign + JSON.stringify(this.translationJson);
  }

  public translateTo(translationsDictionary: TranslationsDictionary) {
    let target = translationsDictionary[this.translationJson.original];

    if (target === undefined) {
      // tslint:disable-next-line: no-console
      console.warn(`Translations Warning - Missing translation: ${target}`);
      return this.translationJson.original;
    }

    if (this.translationJson.params.length > 0) {
      for (let i = 0; i < this.translationJson.params.length; i++) {
        const param = this.translationJson.params[i].toString();
        target = target.replace(new RegExp(`\\{${i}\\}`, 'g'), translationsDictionary[param] || param);
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
          return `${card.Name} ${TranslationPack.patchEmojiOrImageInTranslation(card.Suit)} ${card.CardNumber}`;
        }),
      )
    );
  }

  public static patchPlayerInTranslation(...players: Player[]) {
    return (
      TranslationPack.translatePlayerObjectSign +
      JSON.stringify(players.map(player => `${player.Character.Name} ${player.Position}`))
    );
  }

  public static isCardObjectText(text: string) {
    return text.startsWith(TranslationPack.translateCardObjectSign);
  }

  public static isTextArrayText(text: string) {
    return text.startsWith(TranslationPack.translateTextArraySign);
  }

  public static isPlayerObjectText(text: string) {
    return text.startsWith(TranslationPack.translatePlayerObjectSign);
  }

  public static patchPureTextParameter(text: string) {
    return TranslationPack.pureTextSign + text;
  }
  public static isPureTextParameter(text: string) {
    return text.startsWith(TranslationPack.pureTextSign);
  }

  public static patchEmojiOrImageInTranslation(rawText: string | number) {
    return TranslationPack.translateCardObjectSign + rawText;
  }

  public static dispatchEmojiOrImageInTranslation(rawText: string): CardSuit {
    return parseInt(rawText.slice(TranslationPack.translateCardObjectSign.length), 10);
  }

  public static dispatch(wrappedString: string) {
    try {
      const translateObject: TranslationPackPatchedObject = JSON.parse(
        wrappedString.slice(TranslationPack.translationObjectSign.length),
      );
      if (!translateObject.tag || translateObject.tag !== TranslationPack.translationObjectSign) {
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

  public static translationJsonPatcher(originalText: string, ...stringParams: (string | number)[]) {
    const translationJson: TranslationPackPatchedObject = {
      tag: TranslationPack.translationObjectSign,
      original: originalText,
      params: stringParams,
    };

    return new TranslationPack(translationJson);
  }

  public static translationJsonDispatcher(wrappedString: string, translationsDictionary: TranslationsDictionary) {
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
