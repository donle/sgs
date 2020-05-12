import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'tiandu', description: 'tiandu_description' })
export class TianDu extends TriggerSkill {
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
    await room.moveCards({
      movingCards: [{ card: judgeEvent.judgeCardId, fromArea: CardMoveArea.ProcessingArea }],
      toArea: CardMoveArea.HandArea,
      toId: skillUseEvent.fromId,
      moveReason: CardMoveReason.ActivePrey,
      proposer: skillUseEvent.fromId,
      movedByReason: this.GeneralName,
    });

    return true;
  }
}
