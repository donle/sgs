import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';
import { ZhuQueYuShanSkill } from 'core/skills';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';

export class ZhuQueYuShanSkillTrigger extends TriggerSkillTriggerClass<ZhuQueYuShanSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: ZhuQueYuShanSkill) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
