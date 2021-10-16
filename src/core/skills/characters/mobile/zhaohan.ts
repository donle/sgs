import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'zhaohan', description: 'zhaohan_description' })
export class ZhaoHan extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id === content.playerId &&
      PlayerPhaseStages.PrepareStageStart === content.toStage &&
      owner.hasUsedSkillTimes(this.Name) < 7
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.audioIndex = room.getPlayerById(event.fromId).hasUsedSkillTimes(this.Name) <= 4 ? 1 : 2;

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const usedTimes = room.getPlayerById(event.fromId).hasUsedSkillTimes(this.Name);
    if (usedTimes <= 4) {
      await room.changeMaxHp(event.fromId, 1);
      await room.recover({
        toId: event.fromId,
        recoveredHp: 1,
        recoverBy: event.fromId,
      });
    } else {
      await room.changeMaxHp(event.fromId, -1);
    }

    return true;
  }
}
