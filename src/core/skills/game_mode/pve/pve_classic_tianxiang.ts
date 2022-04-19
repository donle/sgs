import { CardColor, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'pve_classic_tianxiang', description: 'pve_classic_tianxiang_description' })
export class PveClassicTianXiang extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.DamageFinishedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return content.toId === owner.Id && owner.isInjured();
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === owner.MaxHp - owner.Hp;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return room.canDropCard(owner, cardId);
  }

  getSkillLog(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return TranslationPack.translationJsonPatcher('{0}: you can drop {1}', this.Name, owner.MaxHp - owner.Hp).extract();
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    if (!event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, owner.Id, owner.Id, this.Name);

    const blackCardNumber = event.cardIds.filter(
      cardId => Sanguosha.getCardById(cardId).Color === CardColor.Black,
    ).length;

    if (blackCardNumber === 0) {
      const fromId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId;
      const damageFrom = fromId && room.getPlayerById(fromId);
      if (damageFrom && !damageFrom.Dead) {
        await room.damage({
          fromId: owner.Id,
          damage: 1,
          damageType: DamageType.Normal,
          toId: damageFrom.Id,
          triggeredBySkills: [this.Name],
        });
      }
    } else {
      await room.drawCards(blackCardNumber * 2, owner.Id);
    }

    return true;
  }
}
