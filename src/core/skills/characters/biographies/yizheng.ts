import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
  RecoverEffectStage,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yizheng', description: 'yizheng_description' })
export class YiZheng extends TriggerSkill {
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
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = skillUseEvent;
    const toId = Precondition.exists(toIds, 'Unable to get yizheng target')[0];

    const yiZhengUsers = room.getFlag<PlayerId[]>(toId, this.Name) || [];
    if (!yiZhengUsers.includes(fromId)) {
      yiZhengUsers.push(fromId);
    }
    room.setFlag<PlayerId[]>(toId, this.Name, yiZhengUsers, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: YiZheng.Name, description: YiZheng.Description })
export class YiZhengShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayer.Id === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  private clearFlag(room: Room, owner: PlayerId) {
    for (const other of room.getOtherPlayers(owner)) {
      const yiZhengUsers = other.getFlag<PlayerId[]>(this.GeneralName);
      if (yiZhengUsers && yiZhengUsers.includes(owner)) {
        if (yiZhengUsers.length === 1) {
          room.removeFlag(other.Id, this.GeneralName);
          continue;
        }
        const index = yiZhengUsers.findIndex(playerId => playerId === owner);
        yiZhengUsers.splice(index, 1);
        room.setFlag(other.Id, this.GeneralName, yiZhengUsers, this.GeneralName);
      }
    }
  }

  public async whenDead(room: Room, player: Player) {
    this.clearFlag(room, player.Id);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent | GameEventIdentifiers.PhaseChangeEvent
    >,
    stage?: AllStage,
  ): boolean {
    return (
      stage === DamageEffectStage.DamageEffect ||
      stage === RecoverEffectStage.RecoverEffecting ||
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent | GameEventIdentifiers.PhaseChangeEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (!damageEvent.fromId || room.getPlayerById(damageEvent.fromId).Dead) {
        return false;
      }
      const source = room.getPlayerById(damageEvent.fromId);
      const yiZhengUsers = source.getFlag<PlayerId[]>(this.GeneralName);
      return yiZhengUsers && yiZhengUsers.includes(owner.Id) && source.MaxHp < owner.MaxHp;
    } else if (identifier === GameEventIdentifiers.RecoverEvent) {
      const recoverEvent = content as ServerEventFinder<GameEventIdentifiers.RecoverEvent>;
      const to = room.getPlayerById(recoverEvent.toId);
      const yiZhengUsers = to.getFlag<PlayerId[]>(this.GeneralName);
      return yiZhengUsers && yiZhengUsers.includes(owner.Id) && to.MaxHp < owner.MaxHp;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.toPlayer === owner.Id && phaseChangeEvent.to === PlayerPhase.PhaseBegin;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.RecoverEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      await room.changeMaxHp(fromId, -1);
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
    } else if (identifier === GameEventIdentifiers.RecoverEvent) {
      await room.changeMaxHp(fromId, -1);
      const recoverEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.RecoverEvent>;
      recoverEvent.recoveredHp++;
    } else {
      this.clearFlag(room, fromId);
    }

    return true;
  }
}
