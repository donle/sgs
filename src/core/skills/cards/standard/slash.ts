import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Slash } from 'core/cards/standard/slash';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
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

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId, selectedTargets: PlayerId[], containerCard: CardId) {
    return (
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room.canAttack(room.getPlayerById(owner), room.getPlayerById(target))
    );
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const slashCard = Sanguosha.getCardById<Slash>(event.cardId);
    slashCard.setDrunkLevel(room.getPlayerById(event.fromId).hasDrunk());

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
        const slashCard = Sanguosha.getCardById<Slash>(cardId);
        const damageEvent = {
          fromId,
          toId,
          damage: 1 + slashCard.getDrunkLevel(),
          damageType: this.damageType,
          cardIds: [cardId],
          triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
        };

        await room.damage(damageEvent);
        slashCard.clearDrunkLevel();
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
