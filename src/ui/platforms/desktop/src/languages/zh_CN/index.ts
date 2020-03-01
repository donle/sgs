import { TranslationsDictionary, Word } from 'languages';
import * as dictionaryBook from './translations';

function wordsToDictionary(words: Word[]): TranslationsDictionary {
  const dict: TranslationsDictionary = {};

  for (const word of words) {
    dict[word.source] = word.target;
  }
  return dict;
}

export const SimplifiedChinese: TranslationsDictionary = {};
Object.values(dictionaryBook).forEach(dictionay => {
  Object.assign(SimplifiedChinese, wordsToDictionary(dictionay));
});
