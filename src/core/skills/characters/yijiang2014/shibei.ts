import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'shibei', description: 'shibei_description' })
export class ShiBei extends TriggerSkill {
  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.FinishStage;
  }

  whenRefresh(room: Room, owner: Player) {
    if (room.getFlag<boolean>(owner.Id, this.GeneralName) === true) {
      room.removeFlag(owner.Id, this.GeneralName);
    }
  }

  async whenObtainingSkill(room: Room, owner: Player) {
    if (room.Analytics.getDamagedRecord(owner.Id, true).length > 0) {
      room.setFlag(owner.Id, this.GeneralName, true, this.GeneralName);
    }
  }

  async whenLosingSkill(room: Room, owner: Player) {
    if (room.getFlag<boolean>(owner.Id, this.GeneralName) === true) {
      room.removeFlag(owner.Id, this.GeneralName);
    }
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
    if (room.getFlag<boolean>(event.fromId, this.GeneralName) !== true) {
      room.setFlag(event.fromId, this.GeneralName, true, this.GeneralName);
    }

    if (room.Analytics.getDamagedRecord(event.fromId, true).length <= 1) {
      const damagedEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      await room.recover({ recoveredHp: 1, recoverBy: damagedEvent.toId, toId: damagedEvent.toId });
    } else {
      await room.loseHp(event.fromId, 1);
    }

    return true;
  }
}
