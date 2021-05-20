import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

// 难2 【龙律】锁定技，一名角色结束阶段开始时，你与其各回复一点体力，回复前若你受伤，则当前回合角色失去体力上限一半体力，回复后若其未受伤，则你与其各摸1张牌。
@CompulsorySkill({ name: 'pve_longlv', description: 'pve_longlv_description' })
export class PveLongLv extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const current = room.CurrentPhasePlayer;
    let x: number = 1;
    if (x<5) {
      await room.recover({
        recoveredHp: 1,
        recoverBy: current.Id,
        toId: current.Id,
      });
      if (room.getPlayerById(fromId).LostHp > 0) {
        await room.loseHp(current.Id, (current.MaxHp)/2);
      }
      await room.recover({
        recoveredHp: 1,
        recoverBy: fromId,
        toId: fromId,
      });
      if (current.LostHp === 0) {
        x++
        await room.drawCards(1, current.Id, 'top', current.Id, this.Name);
        await room.drawCards(1, fromId, 'top', current.Id, this.Name);
      }
    }
     if(x===5){
      for (const player of room.getOtherPlayers(fromId)) {       
          await room.loseHp(player.Id, 1);      
    }
    }
    
    return true;
  }
}
