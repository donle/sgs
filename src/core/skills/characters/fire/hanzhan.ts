import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PinDianStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'hanzhan', description: 'hanzhan_description' })
export class HanZhan extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PinDianStage.BeforePinDianEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PinDianEvent>) {
    return owner.Id === content.fromId || content.toIds.includes(owner.Id);
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const pindianEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PinDianEvent>;
    if (pindianEvent.fromId === fromId) {
      pindianEvent.randomPinDianCardPlayer.push(...pindianEvent.toIds);
    } else {
      pindianEvent.randomPinDianCardPlayer.push(pindianEvent.fromId);
    }

    return true;
  }
}
