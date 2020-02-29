export * from './zh_CN';

export type Word = {
  source: string;
  target: string;
};

export type TranslationsDictionary = {
  [k: string]: string;
};
