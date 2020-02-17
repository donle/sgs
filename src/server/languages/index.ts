import { Languages } from 'core/translations/translation_json_tool';
import { translations as SimplifiedChinese } from './zh_cn';

type TranslationList = typeof SimplifiedChinese;
export type TranslationKeys = keyof TranslationList;

type TranslationsList = {
  [K in Languages]?: TranslationList;
};

const allTranslations: TranslationsList = {
  [Languages.ZH_CN]: SimplifiedChinese,
};

export const getLanguageDictionary = (lang: Languages) => {
  return allTranslations[lang];
};
