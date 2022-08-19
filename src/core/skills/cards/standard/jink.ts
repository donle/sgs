import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Room } from 'core/room/room';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jink', description: 'jink_description' })
export class JinkSkill extends ResponsiveSkill {
  public responsiveFor() {
    return new CardMatcher({
      name: ['jink'],
    });
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { responseToEvent, toCardIds } = event;
    if (responseToEvent !== undefined && toCardIds !== undefined) {
      if (EventPacker.getIdentifier(responseToEvent) === GameEventIdentifiers.CardEffectEvent) {
        (responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>).isCancelledOut = true;
      }
    }

    return true;
  }
}
