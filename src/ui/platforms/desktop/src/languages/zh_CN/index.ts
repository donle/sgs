import { TranslationsDictionary, Word } from 'languages';
import * as dictionary from './translations';

function wordsToDictionary(words: Word[]): TranslationsDictionary {
  const dict: TranslationsDictionary = {};

  for (const word of words) {
    dict[word.source] = word.target;
  }
  return dict;
}

export const SimplifiedChinese = {
  ...wordsToDictionary(dictionary.cardDictionary),
  ...wordsToDictionary(dictionary.characterDictionary),
  ...wordsToDictionary(dictionary.eventDictionary),
  ...wordsToDictionary(dictionary.UiDictionary),
};
