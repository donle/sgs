import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TriggerSkill } from 'core/skills/skill';
import { ServerEventFinder, GameEventIdentifiers } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';

@CompulsorySkill({ name: 'pve_ruiyan', description: 'pve_ruiyan_description' })
export class PveRuiYan extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && PlayerPhaseStages.FinishStageStart === content.toStage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(3, skillUseEvent.fromId, 'top', skillUseEvent.fromId, this.Name);

    return true;
  }
}
