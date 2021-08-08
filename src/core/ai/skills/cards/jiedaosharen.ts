import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { JieDaoShaRenSkill } from 'core/skills';

export class JieDaoShaRenSkillTrigger extends ActiveSkillTriggerClass<JieDaoShaRenSkill> {
  protected filterTargets(room: Room, ai: Player, skill: JieDaoShaRenSkill, card: CardId, enemies: Player[]) {
    if (enemies.length <= 1) {
      const jinkCards = AiLibrary.findCardsByMatcher(room, ai, new CardMatcher({ name: ['jink'] }));
      if (jinkCards.length === 0 && ai.getEquipment(CardType.Shield) === undefined) {
        return [];
      }

      const canAttackSelf = enemies.find(e => room.canAttack(e, ai));
      if (!canAttackSelf) {
        return [];
      }

      return [canAttackSelf.Id, ai.Id];
    }

    for (const attacker of enemies) {
      const target = AiLibrary.sortEnemiesByRole(room, ai).find(e => e !== attacker && room.canAttack(attacker, e));
      if (target) {
        return [attacker.Id, target.Id];
      }
    }

    return [];
  }

  skillTrigger = (
    room: Room,
    ai: Player,
    skill: JieDaoShaRenSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const enemies = AiLibrary.sortEnemiesByRole(room, ai).filter(e => e.getEquipment(CardType.Weapon) !== undefined);

    if (enemies.length === 0) {
      return;
    }

    const targets = this.filterTargets(room, ai, skill, skillInCard!, enemies);
    if (targets.length === 0) {
      return;
    }

    return {
      fromId: ai.Id,
      cardId: skillInCard!,
      toIds: targets,
    };
  };
}
