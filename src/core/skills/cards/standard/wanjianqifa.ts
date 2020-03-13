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
export class WanJianQiFaSkill extends ActiveSkill {
  constructor() {
    super('wanjianqifa', 'wanjianqifa_description');
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
    const others = room.getOtherPlayers(event.fromId);

    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used card {1} to {2}',
      room.getPlayerById(event.fromId).Character.Name,
      TranslationPack.patchCardInTranslation(event.cardId),
      TranslationPack.wrapArrayParams(
        ...others.map(target => target.Character.Name),
      ),
    ).extract();
    event.toIds = others.map(player => player.Id);
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const { toIds, fromId, cardId } = event;

    const askForCardEvent: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
      cardMatcher: new CardMatcher({
        name: ['jink'],
      }).toSocketPassenger(),
      byCardId: cardId,
      cardUserId: fromId,
      conversation:
        fromId !== undefined
          ? TranslationPack.translationJsonPatcher(
              '{0} used {1} to you, please response a {2} card',
              room.getPlayerById(fromId).Character.Name,
              TranslationPack.patchCardInTranslation(cardId),
              'jink',
            ).extract()
          : TranslationPack.translationJsonPatcher(
              'please response a {0} card',
              'jink',
            ).extract(),
    };

    for (const to of toIds || []) {
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
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} hits {1} for {2} {3} hp',
            room.getPlayerById(fromId!).Name,
            room.getPlayerById(to).Name,
            1,
            DamageType.Normal,
          ).extract(),
        };

        await room.damage(eventContent);
      } else {
        const cardResponsedEvent = {
          fromId: to,
          cardId: response.cardId,
        };

        await room.responseCard(cardResponsedEvent);
      }
    }

    return true;
  }
}
