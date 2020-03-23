import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(1)
export class SlashSkill extends ActiveSkill {
  protected damageType: DamageType = DamageType.Normal;

  constructor() {
    super('slash', 'slash_description');
  }

  public canUse() {
    return true;
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, cards: CardId[]) {
    return cards.length === 0;
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId, selectedTargets: PlayerId[], containerCard: CardId) {
    return room.canAttack(room.getPlayerById(owner), room.getPlayerById(target), containerCard);
  }

  private readonly DrunkTag = 'drunkLevel';

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const player = room.getPlayerById(event.fromId);
    EventPacker.addMiddleware(
      {
        tag: this.DrunkTag,
        data: player.hasDrunk(),
      },
      event,
    );
    //TODO: broadcast clearHeaded status
    player.clearHeaded();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    const toId = Precondition.exists(toIds, 'Unable to get slash target')[0];

    const askForUseCardEvent = {
      toId,
      cardMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
      byCardId: cardId,
      cardUserId: fromId,
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
      conversation:
        fromId !== undefined
          ? TranslationPack.translationJsonPatcher(
              '{0} used {1} to you, please use a {2} card',
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
              TranslationPack.patchCardInTranslation(cardId),
              'jink',
            ).extract()
          : TranslationPack.translationJsonPatcher(
              'please use a {0} card to response {1}',
              'jink',
              TranslationPack.patchCardInTranslation(cardId),
            ).extract(),
      triggeredOnEvent: event,
    };

    const result = await room.askForCardUse(askForUseCardEvent, toId);
    const { responseEvent } = result;
    if (responseEvent && responseEvent.cardId !== undefined) {
      await room.useCard({
        fromId: toId,
        cardId: responseEvent.cardId,
        toCardIds: [cardId],
        responseToEvent: event,
      });
    }
    if (EventPacker.isTerminated(event)) {
      return false;
    }

    const addtionalDrunkDamage = EventPacker.getMiddleware<number>(this.DrunkTag, event) || 0;
    const damageEvent = {
      fromId,
      toId,
      damage: 1 + addtionalDrunkDamage,
      damageType: this.damageType,
      cardIds: [cardId],
      triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
    };

    await room.damage(damageEvent);

    return true;
  }
}

export class ThunderSlashSkill extends SlashSkill {
  protected damageType = DamageType.Thunder;
}

export class FireSlashSkill extends SlashSkill {
  protected damageType = DamageType.Fire;
}
