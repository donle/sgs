import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ShangShi } from 'core/skills';
import { TriggerSkillTriggerClass } from '../../base/trigger_skill_trigger';

export class ShangShiSkillTrigger extends TriggerSkillTriggerClass<ShangShi> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: ShangShi) => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };
}
