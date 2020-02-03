import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, SkillType } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

export class WanJianQiFaSkill extends ActiveSkill {
  constructor() {
    super('wanjianqifa', 'wanjianqifa_description', SkillType.Common);
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
  public async onUse(room: Room, owner: PlayerId, cardIds?: CardId[]) {
    const eventObject: EventPicker<
      GameEventIdentifiers.CardUseEvent,
      WorkPlace.Server
    > = {
      fromId: owner,
      toIds: room.AlivePlayers.filter(player => player.Id !== owner).map(
        player => player.Id,
      ),
      cardId: cardIds![0],
    };

    await room.Processor.onHandleIncomingEvent(GameEventIdentifiers.CardUseEvent, eventObject);
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    const { toIds, fromId, cardId } = event;

    for (const to of toIds!) {
      room.notify(
        GameEventIdentifiers.AskForCardResponseEvent,
        {
          carMatcher: new CardMatcher({
            name: ['jink'],
          }).toSocketPassenger(),
          byCardId: cardId,
          cardUserId: fromId,
        },
        to,
      );

      const response = await room.onReceivingAsyncReponseFrom<
        EventPicker<
          GameEventIdentifiers.AskForCardResponseEvent,
          WorkPlace.Client
        >
      >(GameEventIdentifiers.AskForCardResponseEvent, to);

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
          ),
        };

        await room.Processor.onHandleIncomingEvent(GameEventIdentifiers.DamageEvent, eventContent);
      }
    }
  }

  canUse() {
    return true;
  }
}
