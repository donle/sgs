import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';

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
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { responseToEvent } = event;
    if (responseToEvent === undefined) {
      throw new Error('Unavble to get slash use event when jin is on effect');
    }

    EventPacker.terminate(responseToEvent);
    return true;
  }
}
