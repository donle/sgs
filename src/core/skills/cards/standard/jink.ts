import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';

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

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { responseToEvent } = event;
    if (responseToEvent !== undefined) {
      EventPacker.terminate(responseToEvent);
    }

    return true;
  }
}
