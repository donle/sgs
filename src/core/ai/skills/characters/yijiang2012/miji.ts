import { GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MiJi } from 'core/skills';
import { TriggerSkillTriggerClass } from '../../base/trigger_skill_trigger';

export class MiJiSkillTrigger extends TriggerSkillTriggerClass<MiJi, GameEventIdentifiers.PhaseStageChangeEvent> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: MiJi) => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };
}
