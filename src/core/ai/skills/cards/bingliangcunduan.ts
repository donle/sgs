import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { BingLiangCunDuanSkill } from 'core/skills';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';

export class BingLiangCunDuanSkillTrigger extends ActiveSkillTriggerClass<BingLiangCunDuanSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: BingLiangCunDuanSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const availableTargets = AiLibrary.sortEnemiesByRole(room, ai).filter(target =>
      skill.isAvailableTarget(ai.Id, room, target.Id, [], [], skillInCard!),
    );

    const targets = this.filterTargets(room, ai, skill, skillInCard!, availableTargets);
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
