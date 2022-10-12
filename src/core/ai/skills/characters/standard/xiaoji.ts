import { TriggerSkillTriggerClass } from 'core/ai/skills/base/trigger_skill_trigger';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { XiaoJi } from 'core/skills';
export class XiaoJiSkillTrigger extends TriggerSkillTriggerClass<XiaoJi> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: XiaoJi) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
