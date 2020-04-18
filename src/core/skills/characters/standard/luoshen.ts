import { CardObtainedReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, JudgeEffectStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class LuoShen extends TriggerSkill {
  constructor() {
    super('luoshen', 'luoshen_description');
  }

  isAutoTrigger(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.JudgeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return identifier === GameEventIdentifiers.JudgeEvent;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.JudgeEvent>,
    stage?: AllStage,
  ) {
    return stage === PhaseStageChangeStage.StageChanged || stage === JudgeEffectStage.AfterJudgeEffect;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.JudgeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return owner.Id === content.playerId && PlayerPhaseStages.PrepareStage === content.toStage;
    } else if (identifier === GameEventIdentifiers.JudgeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      return owner.Id === content.toId && content.bySkill === this.GeneralName;
    }

    return false;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = event;
    const identifier = triggeredOnEvent && EventPacker.getIdentifier(triggeredOnEvent);
    if (identifier === GameEventIdentifiers.JudgeEvent) {
      event.translationsMessage = undefined;
    }
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;

    const identifier = triggeredOnEvent && EventPacker.getIdentifier(triggeredOnEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
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
    } else if (identifier === GameEventIdentifiers.JudgeEvent) {
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
    }

    return true;
  }
}
