import { CardMatcher } from 'core/cards/libs/card_matcher';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';
import { CommonSkill, ResponsiveSkill } from 'core/skills/skill';

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

    if (!responseToEvent || EventPacker.getIdentifier(responseToEvent) !== GameEventIdentifiers.CardEffectEvent) {
      return false;
    }

    (responseToEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>).isCancelledOut = true;

    room.doNotify(
      room.AlivePlayers.map(player => player.Id),
      1500,
    );
    await room.sleep(1500);

    return true;
  }
}
