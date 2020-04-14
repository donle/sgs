import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
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
  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const others = room.getOtherPlayers(event.fromId);
    const from = room.getPlayerById(event.fromId);
    event.toIds = others.filter(player => from.canUseCardTo(room, event.cardId, player.Id)).map(player => player.Id);
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const to = Precondition.exists(toIds, 'Unknown targets in nanmanruqing')[0];

    const askForCardEvent = {
      cardMatcher: new CardMatcher({
        name: ['slash'],
      }).toSocketPassenger(),
      byCardId: cardId,
      cardUserId: fromId,
      conversation:
        fromId !== undefined
          ? TranslationPack.translationJsonPatcher(
              '{0} used {1} to you, please response a {2} card',
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
              TranslationPack.patchCardInTranslation(cardId),
              'slash',
            ).extract()
          : TranslationPack.translationJsonPatcher('please response a {0} card', 'slash').extract(),
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
    };

    const result = await room.askForCardResponse(
      {
        ...askForCardEvent,
        toId: to,
      },
      to,
    );

    const { terminated, responseEvent } = result;

    if (terminated) {
      return false;
    } else if (!responseEvent || responseEvent.cardId === undefined) {
      const eventContent = {
        fromId,
        toId: to,
        damage: 1,
        damageType: DamageType.Normal,
        cardIds: [event.cardId],
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
      };

      await room.damage(eventContent);
    } else {
      const cardResponsedEvent: ServerEventFinder<GameEventIdentifiers.CardResponseEvent> = {
        fromId: to,
        cardId: responseEvent.cardId,
      };
      EventPacker.terminate(event);

      await room.responseCard(cardResponsedEvent);
    }

    return true;
  }
}
