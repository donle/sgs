import * as React from 'react';
import { Languages, TranslationPack, TranslationsDictionary } from './translation_json_tool';
import { TranslationModule } from './translation_module';

export class ClientTranslationModule extends TranslationModule {
  public static setup(currentLanguage: Languages, ...dictionaries: [Languages, TranslationsDictionary][]) {
    const translator = new ClientTranslationModule(...dictionaries);
    translator.currentLanguage = currentLanguage;

    return translator;
  }

  private static readonly uniquNumberOnCard = {
    1: 'A',
    11: 'J',
    12: 'Q',
    13: 'K',
  };

  public static getCardNumber(cardNumber: number): string {
    return ClientTranslationModule.uniquNumberOnCard[cardNumber] || cardNumber.toString();
  }

  public trx(rawText: string): JSX.Element {
    const dispatchedObject = TranslationPack.dispatch(rawText);

    if (!dispatchedObject) {
      return <span>{this.tr(rawText)}</span>;
    }

    const dictionary = this.dictionary.get(this.currentLanguage);
    const translatedOriginalText = dictionary
      ? dictionary[dispatchedObject.original] || dispatchedObject.original
      : dispatchedObject.original;
    const paramIndex = translatedOriginalText
      .match(/\{[0-9]\}/g)
      ?.map(indexString => parseInt(indexString.replace(/(\{|\})/g, ''), 10));
    if (!paramIndex) {
      return <span>{this.tr(rawText)}</span>;
    }

    const emojiStyle: React.CSSProperties = {
      height: 12,
      width: 12,
    };
    const commonTextStyle: React.CSSProperties = {
      padding: '0 4px',
    };
    const boldTextStyle: React.CSSProperties = {
      fontWeight: 550,
    };

    const textCombinations: JSX.Element[] = dispatchedObject.params.map(param => {
      if (typeof param === 'string' && dictionary && TranslationPack.isCardObjectText(param)) {
        const translatedCardObject = TranslationPack.translatePatchedCardText(param, dictionary);

        return (
          <>
            {translatedCardObject.map((cardObject, index) => (
              <span key={index}>
                <span>{this.tr('[')}</span>
                <img style={emojiStyle} src={cardObject.suitImageUrl} alt={cardObject.cardName} />
                <span style={boldTextStyle}>
                  {ClientTranslationModule.getCardNumber(parseInt(cardObject.cardNumber, 10))}
                </span>
                <span
                  style={{
                    ...boldTextStyle,
                    ...commonTextStyle,
                  }}
                >
                  {cardObject.cardName}
                </span>
                <span>{this.tr(']')}</span>
              </span>
            ))}
          </>
        );
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
          style={{
            ...boldTextStyle,
            ...commonTextStyle,
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
        translatedReactComponents.push(<span>{splitRawText[i]}</span>);
      }
      if (textCombinations[paramIndex[i]]) {
        translatedReactComponents.push(textCombinations[paramIndex[i]]);
      }
    }

    return <>{translatedReactComponents}</>;
  }
}
