import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill } from 'core/skills/skill_wrappers';
import { JiuShi } from './jiushi';

@AwakeningSkill({ name: 'chengzhang', description: 'chengzhang_description' })
export class ChengZhang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.playerId === owner.Id &&
      event.toStage === PlayerPhaseStages.PrepareStageStart &&
      room.Analytics.getDamage(owner.Id) + room.Analytics.getDamaged(owner.Id) >= 7
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const player = room.getPlayerById(skillEffectEvent.fromId);
    await room.recover({
      recoveredHp: 1,
      toId: skillEffectEvent.fromId,
      recoverBy: skillEffectEvent.fromId,
    });

    await room.drawCards(1, skillEffectEvent.fromId, 'top', undefined, this.Name);

    player.setFlag<boolean>(JiuShi.levelUp, true);

    return true;
  }
}
