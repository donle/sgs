import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';

export const createTranslationMessages = (translator: ClientTranslationModule) => ({
  characterPackageSettings: () => translator.tr('character package settings'),
  gameSettings: () => translator.tr('room settings'),
  gameMode: () => translator.tr('game mode'),
  characterBlockList: () => translator.tr('character block list'),
  enableObserver: () => translator.tr('enable observer'),
  fortuneCardExchangeLimit: () => translator.tr('fortune card exchange limit'),
  getTimeLimit: action =>
    TranslationPack.translationJsonPatcher('{0} time limit', action).translateTo(translator.Dictionary),
  second: () => translator.tr('second'),
  times: () => translator.tr('times'),
  passcode: () => translator.tr('please enter your room passcode'),
  save: () => translator.tr('save settings'),
  forbiddenCharacters: () => translator.tr('forbidden characters'),
  searchCharacterByName: () => translator.tr('search character by name'),

  pveModeSelection: () => translator.tr('pve mode selection'),
  pveDragon: () => translator.tr('two players'),
  pveClassic: () => translator.tr('pve classic two players'),
});
