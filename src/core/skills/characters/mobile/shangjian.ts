import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'shangjian', description: 'shangjian_description' })
export class ShangJian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const lostCardNum = room.Analytics.getLostCard(owner.Id, 'round').length;
    return event.toStage === PlayerPhaseStages.FinishStageStart && lostCardNum > 0 && lostCardNum <= owner.Hp;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(
      room.Analytics.getLostCard(event.fromId, 'round').length,
      event.fromId,
      'top',
      event.fromId,
      this.Name,
    );

    return true;
  }
}
