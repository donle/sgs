import { CardObtainedReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class TianDu extends TriggerSkill {
  constructor() {
    super('tiandu', 'tiandu_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.AfterJudgeEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.JudgeEvent>) {
    return owner.Id === content.toId;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
    await room.obtainCards({
      cardIds: [judgeEvent.judgeCardId],
      toId: skillUseEvent.fromId,
      reason: CardObtainedReason.ActivePrey,
    }, true);

    return true;
  }
}
