import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'shibei', description: 'shibei_description' })
export class ShiBei extends TriggerSkill {
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

@ShadowSkill
@CompulsorySkill({ name: ShiBei.Name, description: ShiBei.Description })
export class ShiBeiShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill() {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.to === PlayerPhase.PhaseFinish && room.getFlag<boolean>(owner.Id, this.GeneralName) === true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);
    return true;
  }
}
