import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xuewei', description: 'xuewei_description' })
export class XueWei extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.Id === content.playerId && PlayerPhaseStages.PrepareStageStart === content.toStage;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('{0}: do you want to choose a Xue Wei target?', this.Name).extract();
  }

  public getAnimationSteps() {
    return [];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const players = room.getFlag<PlayerId[]>(event.toIds[0], this.Name) || [];
    players.includes(event.fromId) || players.push(event.fromId);
    room.setFlag<PlayerId[]>(event.toIds[0], this.Name, players, this.Name, players);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XueWei.Name, description: XueWei.Description })
export class XueWeiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      content.toPlayer === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  private removeXueWeiFlag(room: Room, player: PlayerId) {
    for (const other of room.getOtherPlayers(player)) {
      const players = other.getFlag<PlayerId[]>(this.GeneralName);
      if (players && players.includes(player)) {
        if (players.length === 1) {
          room.removeFlag(other.Id, this.GeneralName);
        } else {
          const index = players.findIndex(p => p === player);
          players.splice(index, 1);
          room.setFlag<PlayerId[]>(other.Id, this.GeneralName, players, this.GeneralName, players);
        }
      }
    }
  }

  public async whenDead(room: Room, player: Player) {
    this.removeXueWeiFlag(room, player.Id);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.DamagedEffect || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      return room
        .getFlag<PlayerId[]>((event as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId, this.GeneralName)
        ?.includes(owner.Id);
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.toPlayer === owner.Id && phaseChangeEvent.to === PlayerPhase.PhaseBegin;
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
      const players = room.getFlag<PlayerId[]>(damageEvent.toId, this.GeneralName);
      if (players.length === 1) {
        room.removeFlag(damageEvent.toId, this.GeneralName);
      } else {
        const index = players.findIndex(p => p === event.fromId);
        players.splice(index, 1);
        room.setFlag<PlayerId[]>(damageEvent.toId, this.GeneralName, players, this.GeneralName, players);
      }

      EventPacker.terminate(damageEvent);

      const source = damageEvent.fromId
        ? room.getPlayerById(damageEvent.fromId).Dead
          ? undefined
          : damageEvent.fromId
        : undefined;
      await room.damage({
        fromId: source,
        toId: event.fromId,
        damage: damageEvent.damage,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });

      source &&
        (await room.damage({
          fromId: event.fromId,
          toId: source,
          damage: damageEvent.damage,
          damageType: damageEvent.damageType,
          triggeredBySkills: [this.Name],
        }));
    } else {
      this.removeXueWeiFlag(room, event.fromId);
    }

    return true;
  }
}
