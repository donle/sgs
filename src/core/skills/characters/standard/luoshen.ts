import { CardObtainedReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, JudgeEffectStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class LuoShen extends TriggerSkill {
  constructor() {
    super('luoshen', 'luoshen_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && PlayerPhaseStages.PrepareStage === content.toStage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    do {
      const judge = await room.judge(skillUseEvent.fromId, undefined, this.name);
      if (Sanguosha.getCardById(judge.judgeCardId).isBlack()) {
        room.notify(
          GameEventIdentifiers.AskForSkillUseEvent,
          {
            invokeSkillNames: [this.name],
            toId: skillUseEvent.fromId,
          },
          skillUseEvent.fromId,
        );
        const { invoke } = await room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForSkillUseEvent,
          skillUseEvent.fromId,
        );
        if (!invoke) {
          break;
        }
      } else {
        break;
      }
    } while (true);

    return true;
  }
}

@ShadowSkill
export class LuoShenShadow extends TriggerSkill {
  constructor() {
    super('luoshen', 'luoshen_description');
  }

  isAutoTrigger() {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.AfterJudgeEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.JudgeEvent>) {
    return content.bySkill === this.GeneralName;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
    if (Sanguosha.getCardById(judgeEvent.judgeCardId).isBlack()) {
      await room.obtainCards(
        {
          toId: skillUseEvent.fromId,
          cardIds: [judgeEvent.judgeCardId],
          reason: CardObtainedReason.ActivePrey,
        },
        true,
      );
    }

    return true;
  }
}
