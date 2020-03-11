import { CardMatcher } from 'core/cards/libs/card_matcher';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Room } from 'core/room/room';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class JinkSkill extends ResponsiveSkill {
  constructor() {
    super('jink', 'jink_description');
  }

  public responsiveFor() {
    return new CardMatcher({
      name: ['jink'],
    });
  }

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {1}',
      Sanguosha.getCardById(event.cardId).Name,
      this.name,
    ).extract();

    return true;
  }

  async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const { responseToEvent } = event;
    if (responseToEvent === undefined) {
      throw new Error('Unavble to get slash use event when jin is on effect');
    }

    EventPacker.terminate(responseToEvent);
    return true;
  }
}
