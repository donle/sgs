import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
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

  isAvailableTarget(room: Room, target: PlayerId) {
    return room.canAttack(room.CurrentPlayer, room.getPlayerById(target));
  }

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {2} to {1}',
      room.CurrentPlayer.Name,
      room.getPlayerById(event.toIds![0]).Name,
      this.name,
    ).extract();

    return true;
  }

  async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const { toIds, fromId, cardId } = event;

    for (const toId of toIds || []) {
      const askForUseCardEvent = {
        carMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
        byCardId: cardId,
        cardUserId: fromId,
        triggeredBySkillName: this.name,
      };

      room.notify(
        GameEventIdentifiers.AskForCardUseEvent,
        askForUseCardEvent,
        toId,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForCardUseEvent,
        toId,
      );

      if (response.cardId !== undefined) {
        await room.useCard({
          fromId: toId,
          cardId: response.cardId,
        });
      } else {
        const damageEvent = {
          fromId,
          toId,
          damage: 1,
          damageType: this.damageType,
          cardIds: [cardId],
          triggeredBySkillName: this.name,
          translationsMessage: fromId
            ? TranslationPack.translationJsonPatcher(
                '{0} hurts {1} for {2} {3} hp',
                room.getPlayerById(fromId).Name,
                room.getPlayerById(toId).Name,
                1,
                this.damageType,
              ).extract()
            : TranslationPack.translationJsonPatcher(
                '{0} got hurt {1} hp',
                room.getPlayerById(toId).Name,
                1,
              ).extract(),
        };

        await room.damage(damageEvent);
      }
    }

    return true;
  }
}

export class ThunderSlashSkill extends SlashSkill {
  protected damageType = DamageType.Thunder;
}

export class FireSlashSkill extends SlashSkill {
  protected damageType = DamageType.Fire;
}
