import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'guixiu', description: 'guixiu_description' })
export class GuiXiu extends TriggerSkill {
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
      event.toStage === PlayerPhaseStages.FinishStageStart &&
      !(owner.Hp % 2 === 0 && owner.LostHp === 0)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (room.getPlayerById(event.fromId).Hp % 2 === 1) {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    } else {
      await room.recover({
        toId: event.fromId,
        recoveredHp: 1,
        recoverBy: event.fromId,
      });
    }

    return true;
  }
}
