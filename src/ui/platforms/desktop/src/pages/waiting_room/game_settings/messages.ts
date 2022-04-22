import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';

export const createTranslationMessages = (translator: ClientTranslationModule) => ({
  characterPackageSettings: () => translator.tr('character package settings'),
  gameSettings: () => translator.tr('room settings'),
  gameMode: () => translator.tr('game mode'),
  characterBlockList: () => translator.tr('character block list'),
  enableObserver: () => translator.tr('enable observer'),
  getTimeLimit: action =>
    TranslationPack.translationJsonPatcher('{0} time limit', action).translateTo(translator.Dictionary),
  inputChatHere: () => translator.tr('input chat here'),
});
