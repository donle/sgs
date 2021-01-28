export * from './zh_CN';
export * from './zh_TW';

export type Word = {
  source: string;
  target: string;
};

export type TranslationsDictionary = {
  [k: string]: string;
};
