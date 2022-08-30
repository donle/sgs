import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jinjian', description: 'jinjian_description' })
export class JinJian extends TriggerSkill {
  private readonly JinJianStage = 'jinjian_stage';
  public static readonly Debuff = 'jinjian_debuff';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect || stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    if (EventPacker.getMiddleware<boolean>(JinJianShadow.Name, content)) {
      return false;
    }

    if (
      stage === DamageEffectStage.DamageEffect
        ? content.fromId === owner.Id && !owner.getFlag<boolean>(this.Name)
        : content.toId === owner.Id && !owner.getFlag<boolean>(JinJian.Debuff)
    ) {
      owner.setFlag<AllStage>(this.JinJianStage, stage!);
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (room.getFlag<AllStage>(event.fromId, this.JinJianStage) === DamageEffectStage.DamageEffect) {
      damageEvent.damage++;
      room.setFlag<boolean>(event.fromId, this.Name, true, 'jinjian-1');
    } else {
      damageEvent.damage--;
      room.setFlag<boolean>(event.fromId, JinJian.Debuff, true, 'jinjian+1');
      if (damageEvent.damage < 1) {
        EventPacker.terminate(damageEvent);
      }
    }

    EventPacker.addMiddleware({ tag: this.Name, data: true }, damageEvent);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: JinJian.Name, description: JinJian.Description })
export class JinJianShadow extends TriggerSkill implements OnDefineReleaseTiming {
  private readonly JinJianShadowStage = 'jinjian_shadow_stage';

  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, player: Player) {
    for (const flagName of [this.GeneralName, JinJian.Debuff]) {
      player.getFlag<boolean>(flagName) !== undefined && room.removeFlag(player.Id, flagName);
    }
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === DamageEffectStage.DamageEffect ||
      stage === DamageEffectStage.DamagedEffect ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent && !EventPacker.getMiddleware<boolean>(this.GeneralName, content)) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (
        stage === DamageEffectStage.DamageEffect
          ? damageEvent.fromId === owner.Id && owner.getFlag<boolean>(this.GeneralName)
          : damageEvent.toId === owner.Id && owner.getFlag<boolean>(JinJian.Debuff)
      ) {
        owner.setFlag<AllStage>(this.JinJianShadowStage, stage!);
        return true;
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (room.getFlag<AllStage>(event.fromId, this.JinJianShadowStage) === DamageEffectStage.DamagedEffect) {
        damageEvent.damage++;
        room.removeFlag(event.fromId, JinJian.Debuff);
      } else {
        damageEvent.damage--;
        room.removeFlag(event.fromId, this.GeneralName);
        if (damageEvent.damage < 1) {
          EventPacker.terminate(damageEvent);
        }
      }

      EventPacker.addMiddleware({ tag: this.Name, data: true }, damageEvent);
    } else {
      for (const flagName of [this.GeneralName, JinJian.Debuff]) {
        room.getFlag<boolean>(event.fromId, flagName) !== undefined && room.removeFlag(event.fromId, flagName);
      }
    }

    return true;
  }
}
