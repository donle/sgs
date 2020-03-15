import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CharacterNationality } from 'core/characters/character';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, LordSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
@LordSkill
export class Hujia extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return (
      identifier === GameEventIdentifiers.AskForCardResponseEvent ||
      identifier === GameEventIdentifiers.AskForCardUseEvent
    );
  }

  constructor() {
    super('hujia', 'hujia_description');
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
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
    const identifier = EventPacker.getIdentifier<
      GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
    >(jinkCardEvent);

    if (identifier === undefined) {
      throw new Error(`Unwrapped event without identifier in ${this.name}`);
    }

    for (const player of room.getAlivePlayersFrom()) {
      if (player.Nationality === CharacterNationality.Wei && player.Id !== fromId) {
        room.notify(identifier, jinkCardEvent, player.Id);

        const response = await room.onReceivingAsyncReponseFrom(identifier, player.Id);

        if (response.cardId !== undefined) {
          const responseCard = Sanguosha.getCardById(response.cardId);

          const cardUseEvent = {
            cardId: VirtualCard.create({
              cardName: responseCard.Name,
              cardNumber: responseCard.CardNumber,
              cardSuit: responseCard.Suit,
            }).Id,
            fromId,
            responseToEvent: jinkCardEvent.triggeredOnEvent,
          };

          await room.responseCard(
            EventPacker.createIdentifierEvent(GameEventIdentifiers.CardResponseEvent, {
              ...cardUseEvent,
              fromId: response.fromId,
            }),
          );

          if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
            await room.useCard(cardUseEvent);
            EventPacker.terminate(jinkCardEvent);
          } else {
            await room.responseCard(cardUseEvent);
            EventPacker.terminate(jinkCardEvent);
          }

          return !EventPacker.isTerminated(cardUseEvent);
        }
      }
    }
    return true;
  }
}
