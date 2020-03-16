import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(1)
export class SlashSkill extends ActiveSkill {
  protected damageType: DamageType = DamageType.Normal;

  private playerDrunkLevel: number;

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
    return (
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room.canAttack(room.getPlayerById(owner), room.getPlayerById(target))
    );
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {2} to {1}',
      room.CurrentPlayer.Name,
      room.getPlayerById(event.toIds![0]).Name,
      this.name,
    ).extract();

    this.playerDrunkLevel = room.getPlayerById(event.fromId).hasDrunk();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId, cardId } = event;
    for (const toId of toIds || []) {
      const askForUseCardEvent = {
        toId,
        cardMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
        byCardId: cardId,
        cardUserId: fromId,
        triggeredBySkillName: event.triggeredBySkillName || this.name,
        conversation:
          fromId !== undefined
            ? TranslationPack.translationJsonPatcher(
                '{0} used {1} to you, please use a {2} card',
                room.getPlayerById(fromId).Character.Name,
                TranslationPack.patchCardInTranslation(cardId),
                'jink',
              ).extract()
            : TranslationPack.translationJsonPatcher(
                'please use a {0} card to response {1}',
                TranslationPack.patchCardInTranslation(cardId),
              ).extract(),
        triggeredOnEvent: event,
      };

      const result = await room.askForCardUse(askForUseCardEvent, toId);
      const { terminated, responseEvent } = result;
      if (terminated) {
        return false;
      } else if (responseEvent && responseEvent.cardId !== undefined) {
        await room.useCard({
          fromId: toId,
          cardId: responseEvent.cardId,
          responseToEvent: event,
        });

        return false;
      } else {
        const damageEvent = {
          fromId,
          toId,
          damage: 1 + this.playerDrunkLevel,
          damageType: this.damageType,
          cardIds: [cardId],
          triggeredBySkillName: event.triggeredBySkillName || this.name,
        };

        await room.damage(damageEvent);
      }
    }

    this.playerDrunkLevel = 0;
    return true;
  }
}

export class ThunderSlashSkill extends SlashSkill {
  protected damageType = DamageType.Thunder;
}

export class FireSlashSkill extends SlashSkill {
  protected damageType = DamageType.Fire;
}
