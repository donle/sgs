import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CharacterNationality } from 'core/characters/character';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, LordSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@LordSkill
export class Hujia extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.AskForCardResponseEvent
      | GameEventIdentifiers.AskForCardUseEvent
    >,
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
    content: ServerEventFinder<
      | GameEventIdentifiers.AskForCardResponseEvent
      | GameEventIdentifiers.AskForCardUseEvent
    >,
  ) {
    const { carMatcher } = content;
    return CardMatcher.match(
      carMatcher,
      new CardMatcher({
        name: ['jink'],
      }),
    );
  }

  async onTrigger(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates skill {1}',
      room.getPlayerById(event.fromId).Name,
      this.name,
    );

    return true;
  }

  async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    const { triggeredOnEvent, fromId } = event;
    const jinkCardEvent = triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.AskForCardUseEvent
      | GameEventIdentifiers.AskForCardResponseEvent
    >;
    const identifier = EventPacker.getIdentifier<
      | GameEventIdentifiers.AskForCardUseEvent
      | GameEventIdentifiers.AskForCardResponseEvent
    >(jinkCardEvent);

    if (identifier === undefined) {
      throw new Error(`Unwrapped event without identifier in ${this.name}`);
    }

    for (const player of room.getAlivePlayersFrom()) {
      if (
        player.Nationality === CharacterNationality.Wei &&
        player.Id !== fromId
      ) {
        room.notify(identifier, jinkCardEvent, player.Id);

        const response = await room.onReceivingAsyncReponseFrom(
          identifier,
          player.Id,
        );

        if (response.cardId !== undefined) {
          const eventIdentifier =
            identifier === GameEventIdentifiers.AskForCardUseEvent
              ? GameEventIdentifiers.CardUseEvent
              : GameEventIdentifiers.CardResponseEvent;
          const cardUseEvent = EventPacker.createIdentifierEvent(
            eventIdentifier,
            {
              cardId: response.cardId,
              fromId,
            },
          );

          await room.Processor.onHandleIncomingEvent(
            eventIdentifier,
            cardUseEvent,
          );

          return false;
        }
      }
    }
    return true;
  }
}
