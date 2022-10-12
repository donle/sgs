import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';
import { GuDingDaoSkill } from 'core/skills';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';

export class GuDingDaoSkillTrigger extends TriggerSkillTriggerClass<GuDingDaoSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: GuDingDaoSkill) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
