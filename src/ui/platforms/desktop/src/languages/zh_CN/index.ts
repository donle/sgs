import { TranslationsDictionary, Word } from 'languages';
import * as dictionaryBook from './translations';

function wordsToDictionary(words: Word[]): TranslationsDictionary {
  const dict: TranslationsDictionary = {};

  for (const word of words) {
    dict[word.source] = word.target;
  }
  return dict;
}

const translationWords = Object.values(dictionaryBook).reduce((prev, current) => prev.concat(current), []);

export const SimplifiedChinese = wordsToDictionary(translationWords);
