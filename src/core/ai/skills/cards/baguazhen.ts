import type { GameEventIdentifiers } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { BaGuaZhenSkill } from 'core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class BaGuaZhenSkillTrigger extends TriggerSkillTriggerClass<
  BaGuaZhenSkill,
  GameEventIdentifiers.AskForCardUseEvent
> {
  skillTrigger = (room: Room, ai: Player, skill: BaGuaZhenSkill) => ({
    fromId: ai.Id,
    invoke: skill.Name,
  });
}
