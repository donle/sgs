import { CardMatcher } from 'core/cards/libs/card_matcher';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'wuxiekeji', description: 'wuxiekeji_description' })
export class WuXieKeJiSkill extends ResponsiveSkill {
  public responsiveFor() {
    return new CardMatcher({
      name: ['wuxiekeji'],
    });
  }

  async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { responseToEvent } = event;

    EventPacker.terminate(Precondition.exists(responseToEvent, 'Unable to get slash use event when jin is on effect'));
    return true;
  }
}
