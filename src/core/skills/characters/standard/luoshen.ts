import { CardObtainedReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

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
    while (true) {
      const judgeEvent = await room.judge(skillUseEvent.fromId,undefined,this.name);
      const card = Sanguosha.getCardById(judgeEvent.judgeCardId);
      if (card.isBlack()) {
        await room.obtainCards({
          cardIds: [judgeEvent.judgeCardId],
          toId: skillUseEvent.fromId,
          reason: CardObtainedReason.ActivePrey,
        }, true);
      } else {
        break;
      }
    }
    return true;
  }
}