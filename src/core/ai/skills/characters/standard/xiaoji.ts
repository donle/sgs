import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { XiaoJi } from 'core/skills';
import { TriggerSkillTriggerClass } from '../../base/trigger_skill_trigger';

export class XiaoJiSkillTrigger extends TriggerSkillTriggerClass<XiaoJi> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: XiaoJi) => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };
}
