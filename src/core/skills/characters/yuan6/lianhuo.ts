import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'lianhuo', description: 'lianhuo_description' })
export class LianHuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      event.toId === owner.Id && !event.isFromChainedDamage && event.damageType === DamageType.Fire && owner.ChainLocked
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage++;

    return true;
  }
}
