import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

// 难1 【瑞烟】锁定技，准备阶段或结束阶段开始时，你摸X张牌（X为其他角色数）。
@CompulsorySkill({ name: 'pve_ruiyan', description: 'pve_ruiyan_description' })
export class PveRuiYan extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart
    ) {
      return true;
    }
    if (content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart) {
      return true;
    }
    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(room.getAlivePlayersFrom().length - 1, skillUseEvent.fromId, 'top', skillUseEvent.fromId, this.Name);

    return true;
  }
}
