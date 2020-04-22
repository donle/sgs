import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Jink } from 'core/cards/standard/jink';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'baguazhen', description: 'baguazhen_description' })
export class BaGuaZhenSkill extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return (
      !EventPacker.isDisresponsiveEvent(event) &&
      (identifier === GameEventIdentifiers.AskForCardResponseEvent ||
        identifier === GameEventIdentifiers.AskForCardUseEvent)
    );
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    if (!content) {
      return true;
    }

    const { cardMatcher } = content;
    return (
      owner.Id === content.toId &&
      CardMatcher.match(
        cardMatcher,
        new CardMatcher({
          name: ['jink'],
        }),
      )
    );
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = event;
    const jinkCardEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
    >;

    const identifier = Precondition.exists(
      EventPacker.getIdentifier<GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent>(
        jinkCardEvent,
      ),
      `Unwrapped event without identifier in ${this.Name}`,
    );

    const judgeEvent = await room.judge(event.fromId, jinkCardEvent.byCardId, this.Name);

    if (Sanguosha.getCardById(judgeEvent.judgeCardId).isRed()) {
      const jink = VirtualCard.create<Jink>({
        cardName: 'jink',
        bySkill: this.Name,
      });

      const cardUseEvent = {
        cardId: jink.Id,
        fromId,
        toCardIds: jinkCardEvent.byCardId === undefined ? undefined : [jinkCardEvent.byCardId],
        responseToEvent: jinkCardEvent.triggeredOnEvent,
      };

      if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
        await room.useCard(cardUseEvent);
        EventPacker.terminate(jinkCardEvent);
      } else {
        await room.responseCard(cardUseEvent);
        EventPacker.terminate(jinkCardEvent);
      }

      return !EventPacker.isTerminated(cardUseEvent);
    }

    return true;
  }
}
