import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_longshen_ziyu', description: 'pve_longshen_ziyu' })
export class PveLongShenZiYu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId && PlayerPhaseStages.PrepareStageStart === content.toStage && owner.isInjured()
    );
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(content.fromId);
    await room.recover({
      recoveredHp: owner.MaxHp - owner.Hp,
      recoverBy: owner.Id,
      toId: owner.Id,
    });

    return true;
  }
}
