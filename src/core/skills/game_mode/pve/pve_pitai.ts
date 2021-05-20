import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

// 难1和2【疲态】锁定技，你跳过出牌阶段并增加一点体力上限(至多增加4)。
@CompulsorySkill({ name: 'pve_pitai', description: 'pve_pitai_description' })
export class PvePiTai extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }
  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.PlayCardStage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    if (room.getPlayerById(fromId).getMark(MarkEnum.Ren) < 4) {
      await room.changeMaxHp(fromId, 1);
      room.addMark(fromId, MarkEnum.Ren, 1);
    }
    await room.skip(fromId, PlayerPhase.PlayCardStage);
    return true;
  }
}
