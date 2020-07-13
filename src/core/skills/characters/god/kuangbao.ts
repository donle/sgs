import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, GameStartStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'kuangbao', description: 'kuangbao_description' })
export class KuangBao extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === GameStartStage.AfterGameStarted ||
      stage === DamageEffectStage.AfterDamageEffect ||
      stage === DamageEffectStage.AfterDamagedEffect
    );
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers>): number {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      return (event as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage;
    } else {
      return 1;
    }
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (room.CurrentProcessingStage === DamageEffectStage.AfterDamageEffect) {
        return damageEvent.fromId === owner.Id;
      } else if (room.CurrentProcessingStage === DamageEffectStage.AfterDamagedEffect) {
        return damageEvent.toId === owner.Id;
      }
      return false;
    } else {
      return !owner.hasUsedSkill(this.Name);
    }
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const unknownEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      room.addMark(skillEffectEvent.fromId, MarkEnum.Wrath, 1);
    } else {
      room.addMark(skillEffectEvent.fromId, MarkEnum.Wrath, 2);
    }

    return true;
  }
}
