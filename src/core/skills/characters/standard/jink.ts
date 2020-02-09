import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
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
    return ['jink'];
  }

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {1}',
      Sanguosha.getCardById(event.fromId).Name,
      this.name,
    );

    return true;
  }

  async onEffect() {
    return true;
  }
}
