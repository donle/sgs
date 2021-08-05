import { GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { BaGuaZhenSkill } from 'core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class BaGuaZhenSkillTrigger extends TriggerSkillTriggerClass<
  BaGuaZhenSkill,
  GameEventIdentifiers.AskForCardUseEvent
> {
  skillTrigger = (room: Room, ai: Player, skill: BaGuaZhenSkill) => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };
}
