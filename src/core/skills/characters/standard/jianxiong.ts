import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class JianXiong extends TriggerSkill {
  constructor() {
    super('jianxiong', 'jianxiong_description');
  }

  isAutoTrigger() {
    return false;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse() {
    return true;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    const { triggeredOnEvent } = skillUseEvent;
    const damagedEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent
    >;
    if (damagedEvent.cardIds !== undefined && damagedEvent.cardIds.length > 0) {
      await room.obtainCards(damagedEvent.cardIds, damagedEvent.toId);
    }
    await room.drawCards(1, damagedEvent.toId);
    return true;
  }
}
