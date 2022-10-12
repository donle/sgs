import { TriggerSkillTriggerClass } from 'core/ai/skills/base/trigger_skill_trigger';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ShangShi } from 'core/skills';

export class ShangShiSkillTrigger extends TriggerSkillTriggerClass<ShangShi> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: ShangShi) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
