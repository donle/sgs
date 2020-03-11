import { CardMatcher } from 'core/cards/libs/card_matcher';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
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
    event.toIds = room.getOtherPlayers(event.fromId).map(player => player.Id);
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const { toIds, fromId, cardId } = event;

    const askForCardEvent: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
      cardMatcher: new CardMatcher({
        name: ['slash'],
      }).toSocketPassenger(),
      byCardId: cardId,
      cardUserId: fromId,
      conversation:
        fromId !== undefined
          ? TranslationPack.translationJsonPatcher(
              '{0} used {1} to you, please response a {2} card',
              room.getPlayerById(fromId).Character.Name,
              TranslationPack.patchCardInTranslation(cardId),
              'slash',
            ).extract()
          : TranslationPack.translationJsonPatcher(
              'please response a {0} card',
              'slash',
            ).extract(),
    };

    for (const to of toIds!) {
      room.notify(
        GameEventIdentifiers.AskForCardResponseEvent,
        askForCardEvent,
        to,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForCardResponseEvent,
        to,
      );

      if (response.cardId === undefined) {
        const eventContent = {
          fromId,
          toId: to,
          damage: 1,
          damageType: DamageType.Normal,
          cardIds: [event.cardId],
          triggeredBySkillName: this.name,
        };

        await room.damage(eventContent);
      } else {
        const cardResponsedEvent: ServerEventFinder<GameEventIdentifiers.CardResponseEvent> = {
          fromId: to,
          cardId: response.cardId,
        };

        await room.responseCard(cardResponsedEvent);
      }
    }
    return true;
  }
}
