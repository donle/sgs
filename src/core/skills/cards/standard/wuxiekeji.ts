import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class WuXieKeJiSkill extends ResponsiveSkill {
  constructor() {
    super('wuxiekeji', 'wuxiekeji_description');
  }

  public responsiveFor() {
    return new CardMatcher({
      name: ['wuxiekeji'],
    });
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used card {1} to {2}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      TranslationPack.patchCardInTranslation(event.cardId),
      TranslationPack.patchCardInTranslation(...(event.toCardIds || [])),
    ).extract();
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { responseToEvent } = event;

    EventPacker.terminate(Precondition.exists(responseToEvent, 'Unable to get slash use event when jin is on effect'));
    return true;
  }
}
