import { CardSuit } from 'core/cards/libs/card_props';
import { Player } from 'core/player/player';
import * as React from 'react';
import { Languages, TranslationPack, TranslationsDictionary } from './translation_json_tool';
import { TranslationModule } from './translation_module';
import { Algorithm } from 'core/shares/libs/algorithm/index';

export type TranslatedCardObject = {
  cardSuit: CardSuit;
  suitElement: JSX.Element;
  cardNumber: string;
  cardName: string;
};
type EmojiOrImageTranslationDictionary = {
  [k: string]: JSX.Element;
};

export class ClientTranslationModule extends TranslationModule {
  private currentPlayer: Player | undefined;
  private emojiOrImageTextDict: EmojiOrImageTranslationDictionary = {};

  public static setup(currentLanguage: Languages, ...dictionaries: [Languages, TranslationsDictionary][]) {
    const translator = new ClientTranslationModule(...dictionaries);
    translator.currentLanguage = currentLanguage;

    return translator;
  }

  public switchLanguage(language: Languages) {
    this.currentLanguage = language;
  }

  private commonTextStyle: React.CSSProperties = {
    padding: '0 4px',
  };
  private boldTextStyle: React.CSSProperties = {
    fontWeight: 600,
  };
  private playerStyle: React.CSSProperties = {
    color: '#C65719',
  };

  private static readonly uniquNumberOnCard = {
    0: '',
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K',
  };

  public static getCardNumber(cardNumber: number): string {
    const numberString = ClientTranslationModule.uniquNumberOnCard[cardNumber];
    return numberString === undefined ? cardNumber.toString() : numberString;
  }

  public setupPlayer(player?: Player) {
    this.currentPlayer = player;
  }

  public addEmojiOrImageSymbolText(...symbolTextPair: [string | number, JSX.Element][]) {
    for (const [rawText, translatePath] of symbolTextPair) {
      this.emojiOrImageTextDict[TranslationPack.patchEmojiOrImageInTranslation(rawText)] = translatePath;
    }
  }
  public getEmojiOrImageSymbolText(symbolText: string | number) {
    return this.emojiOrImageTextDict[symbolText];
  }

  public translatePatchedCardText(text: string, dictionary: TranslationsDictionary): JSX.Element {
    const getCardNumberStyle = (cardSuit: CardSuit): React.CSSProperties => {
      if (cardSuit === CardSuit.Heart || cardSuit === CardSuit.Diamond) {
        return {
          ...this.boldTextStyle,
          color: 'red',
        };
      }
      return {
        ...this.boldTextStyle,
        color: 'black',
      };
    };

    const cardTextArray: string[] = JSON.parse(text.slice(TranslationPack.translateCardObjectSign.length));

    const translatedCardObject = cardTextArray.map(cardText => {
      const [cardName, cardSuitString, cardNumber] = cardText.split(' ');
      return {
        cardSuit: TranslationPack.dispatchEmojiOrImageInTranslation(cardSuitString),
        suitElement: this.getEmojiOrImageSymbolText(cardSuitString),
        cardNumber,
        cardName: dictionary[cardName] || cardName,
      };
    });

    return (
      <>
        {translatedCardObject.map((cardObject, index) => (
          <span key={index}>
            <span>{this.tr('[')}</span>
            <span
              style={{
                ...this.boldTextStyle,
                ...this.commonTextStyle,
              }}
            >
              {cardObject.cardName}
            </span>
            {cardObject.suitElement}
            <span style={getCardNumberStyle(cardObject.cardSuit)} className={'textShadow'}>
              {ClientTranslationModule.getCardNumber(parseInt(cardObject.cardNumber, 10))}
            </span>
            <span>{this.tr(']')}</span>
          </span>
        ))}
      </>
    );
  }

  public translatePatchedPlayerText(text: string, dictionary: TranslationsDictionary): JSX.Element {
    const playerObjectArray: string[] = JSON.parse(text.slice(TranslationPack.translatePlayerObjectSign.length));

    const translatedPlayerObject = playerObjectArray.map(playerText => {
      const [characterName, position] = playerText.split(' ');
      const formattedPosition = `seat ${position}`;
      return (
        `${dictionary[characterName] || characterName}(${dictionary[formattedPosition] || formattedPosition})` +
        (this.currentPlayer && this.currentPlayer.Position.toString() === position ? `(${dictionary['you']})` : '')
      );
    });

    return (
      <span
        style={{
          ...this.playerStyle,
          ...this.boldTextStyle,
          ...this.commonTextStyle,
        }}
      >
        {translatedPlayerObject.join(',')}
      </span>
    );
  }

  public disPatchedPureText(text: string): JSX.Element {
    return <span style={this.boldTextStyle}>{text.slice(TranslationPack.pureTextSign.length)}</span>;
  }

  public trx(rawText: string): JSX.Element {
    const dispatchedObject = TranslationPack.dispatch(rawText);
    const dictionary = this.dictionary.get(this.currentLanguage);

    if (!dispatchedObject) {
      if (dictionary) {
        if (TranslationPack.isCardObjectText(rawText)) {
          return <span>{this.translatePatchedCardText(rawText, dictionary)}</span>;
        } else if (TranslationPack.isPlayerObjectText(rawText)) {
          return this.translatePatchedPlayerText(rawText, dictionary);
        }
      }

      return <span>{this.tr(rawText)}</span>;
    }

    const translatedOriginalText = dictionary
      ? dictionary[dispatchedObject.original] || dispatchedObject.original
      : dispatchedObject.original;
    const paramIndex = translatedOriginalText
      .match(/\{[0-9]\}/g)
      ?.map(indexString => parseInt(indexString.replace(/(\{|\})/g, ''), 10));
    if (!paramIndex) {
      return <span>{this.tr(rawText)}</span>;
    }

    const textCombinations: JSX.Element[] = dispatchedObject.params.map(param => {
      if (typeof param === 'string' && dictionary) {
        if (TranslationPack.isCardObjectText(param)) {
          return <span key={Algorithm.generateUUID()}>{this.translatePatchedCardText(param, dictionary)}</span>;
        } else if (TranslationPack.isPlayerObjectText(param)) {
          return <span key={Algorithm.generateUUID()}>{this.translatePatchedPlayerText(param, dictionary)}</span>;
        } else if (TranslationPack.isPureTextParameter(param)) {
          return <span key={Algorithm.generateUUID()}>{this.disPatchedPureText(param)}</span>;
        }
      }

      if (typeof param === 'string' && dictionary && TranslationPack.isTextArrayText(param)) {
        if (TranslationPack.isTextArrayText(param)) {
          param = param
            .slice(TranslationPack.translateTextArraySign.length)
            .split(',')
            .map(subParam => dictionary[subParam] || subParam)
            .join(',');
        } else {
          param = dictionary[param] || param;
        }
      }

      return (
        <span
          key={Algorithm.generateUUID()}
          style={{
            ...this.boldTextStyle,
            ...this.commonTextStyle,
          }}
        >
          {dictionary ? dictionary[param] || param : param}
        </span>
      );
    });

    const translatedReactComponents: JSX.Element[] = [];
    const splitRawText = translatedOriginalText.split(/\{[0-9]\}/).map(splitStr => splitStr.trim());
    for (let i = 0; i < splitRawText.length; i++) {
      if (splitRawText[i]) {
        translatedReactComponents.push(<span key={i}>{splitRawText[i]}</span>);
      }
      if (textCombinations[paramIndex[i]]) {
        translatedReactComponents.push(textCombinations[paramIndex[i]]);
      }
    }

    return <>{translatedReactComponents}</>;
  }
}
