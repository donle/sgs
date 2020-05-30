import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'wangxi', description: 'wangxi_description' })
export class WangXi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    if (room.CurrentProcessingStage === DamageEffectStage.AfterDamagedEffect) {
      return content.toId === owner.Id && content.fromId !== undefined && !room.getPlayerById(content.fromId).Dead;
    } else {
      return content.fromId === owner.Id && !room.getPlayerById(content.toId).Dead;
    }
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId, toId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    await room.drawCards(1, skillUseEvent.fromId, undefined, skillUseEvent.fromId, this.Name);
    await room.drawCards(
      1,
      skillUseEvent.fromId === fromId ? toId : fromId,
      undefined,
      skillUseEvent.fromId,
      this.Name,
    );
    return true;
  }
}
