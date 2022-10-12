import { TranslationsDictionary, Word } from 'languages';
import * as dictionaryBooks from './translations';

function wordsToDictionary(words: Word[]): TranslationsDictionary {
  const dict: TranslationsDictionary = {};

  for (const word of words) {
    dict[word.source] = word.target;
  }
  return dict;
}

const translationWords: Word[] = [];
for (const book of Object.values(dictionaryBooks)) {
  for (const words of Object.values(book)) {
    translationWords.push(...words);
  }
}

export const SimplifiedChinese = wordsToDictionary(translationWords);
