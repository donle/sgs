import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, SkillEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { FeiJun } from './feijun';

@CompulsorySkill({ name: 'binglve', description: 'binglve_description' })
export class BingLve extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>, stage?: AllStage): boolean {
    return stage === SkillEffectStage.AfterSkillEffected;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): boolean {
    return content.fromId === owner.Id && EventPacker.getMiddleware<boolean>(FeiJun.Name, content) === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
