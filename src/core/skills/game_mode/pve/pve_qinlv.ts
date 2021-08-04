import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_qinlv', description: 'pve_qinlv_description' })
export class PveQinLv extends TriggerSkill {
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
    const owner = room.getPlayerById(event.fromId);
    const player = room.CurrentPhasePlayer;

    await room.recover({ recoveredHp: 1, recoverBy: owner.Id, toId: player.Id });
    if (owner.Id !== player.Id) {
      await room.recover({ recoveredHp: 1, recoverBy: owner.Id, toId: owner.Id });
      if (owner.isInjured()) {
        await room.loseHp(player.Id, Math.floor(player.MaxHp / 2));
      }
    }

    if (!player.isInjured()) {
      await room.drawCards(Math.floor(player.MaxHp / 2), owner.Id, 'top', owner.Id, this.Name);
    }

    return true;
  }
}
