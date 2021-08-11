import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import { ZhuQueYuShanSkill } from 'core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class ZhuQueYuShanSkillTrigger extends TriggerSkillTriggerClass<ZhuQueYuShanSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: ZhuQueYuShanSkill) => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };
}
