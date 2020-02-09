import { CardMatcher } from 'core/cards/libs/card_matcher';
import {
  ClientEventFinder,
  EventPacker,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { DamageType, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class NanManRuQingSkill extends ActiveSkill {
  constructor() {
    super('nanmanruqing', 'nanmanruqing_description');
  }

  public canUse() {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    event.toIds = room.AlivePlayers.filter(
      player => player.Id !== event.fromId,
    ).map(player => player.Id);
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card ${1}',
      room.getPlayerById(event.fromId).Name,
      TranslationPack.patchCardInTranslation(event.cardId),
    );

    await room.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.CardUseEvent,
      event,
    );
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const { toIds, fromId, cardId } = event;

    for (const to of toIds!) {
      room.notify(
        GameEventIdentifiers.AskForCardResponseEvent,
        {
          carMatcher: new CardMatcher({
            name: ['slash'],
          }).toSocketPassenger(),
          byCardId: cardId,
          cardUserId: fromId,
        },
        to,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForCardResponseEvent,
        to,
      );

      if (response.cardId === undefined) {
        const eventContent = EventPacker.createIdentifierEvent(
          GameEventIdentifiers.DamageEvent,
          {
            fromId,
            toId: to,
            damage: 1,
            damageType: DamageType.Normal,
            cardIds: [event.cardId],
            triggeredBySkillName: this.name,
            translationsMessage: TranslationPack.translationJsonPatcher(
              '{0} hits {1} for {2} {3} hp',
              room.getPlayerById(fromId!).Name,
              room.getPlayerById(to).Name,
              1,
              DamageType.Normal,
            ),
          },
        );

        await room.Processor.onHandleIncomingEvent(
          GameEventIdentifiers.DamageEvent,
          eventContent,
        );
      } else {
        const cardResponsedEvent: ServerEventFinder<GameEventIdentifiers.CardResponseEvent> = EventPacker.createIdentifierEvent(
          GameEventIdentifiers.CardResponseEvent,
          {
            fromId: to,
            cardId: response.cardId,
          },
        );

        await room.Processor.onHandleIncomingEvent(
          GameEventIdentifiers.CardResponseEvent,
          cardResponsedEvent,
        );
      }
    }
    return true;
  }
}
