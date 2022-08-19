import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';

export const createTranslationMessages = (translator: ClientTranslationModule) => ({
  systemNotification: () => translator.tr('system notification'),
  roomHostChanged: (playerName: string) =>
    TranslationPack.translationJsonPatcher('room host has been changed to {0}', playerName).translateTo(
      translator.Dictionary,
    ),
  playerLeft: (playerName: string) =>
    TranslationPack.translationJsonPatcher('player {0} has left the room', playerName).translateTo(
      translator.Dictionary,
    ),
  playerEnter: (playerName: string) =>
    TranslationPack.translationJsonPatcher('player {0} join in the room', playerName).translateTo(
      translator.Dictionary,
    ),
});
