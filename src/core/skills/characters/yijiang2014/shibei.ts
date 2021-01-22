import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'shibei', description: 'shibei_description' })
export class ShiBei extends TriggerSkill {
  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.FinishStage;
  }

  whenRefresh(room: Room, owner: Player) {
    room.removeFlag(owner.Id, this.GeneralName);
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return event.toId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (room.getFlag<boolean>(event.fromId, this.Name) !== true) {
      const damagedEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      await room.recover({ recoveredHp: 1, recoverBy: damagedEvent.toId, toId: damagedEvent.toId });
      room.setFlag(event.fromId, this.GeneralName, true, true);
    } else {
      await room.loseHp(event.fromId, 1);
    }
    return true;
  }
}
