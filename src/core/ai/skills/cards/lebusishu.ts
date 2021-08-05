import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { LeBuSiShuSkill } from 'core/skills';

export class LeBuSiShuSkillTrigger extends ActiveSkillTriggerClass<LeBuSiShuSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: LeBuSiShuSkill,
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
