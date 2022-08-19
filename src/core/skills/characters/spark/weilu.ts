import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
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
import { PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'weilu', description: 'weilu_description' })
export class WeiLu extends TriggerSkill {
  public static readonly WeiLuCurrent = 'weilu_current';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.toId === owner.Id &&
      content.fromId !== undefined &&
      content.fromId !== owner.Id &&
      !room.getPlayerById(content.fromId).Dead
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const source = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;

    const originalUsers = room.getFlag<PlayerId[]>(source, this.Name) || [];
    if (room.CurrentPlayer.Id === fromId) {
      const currentUsers = room.getFlag<PlayerId[]>(source, WeiLu.WeiLuCurrent) || [];
      if (!currentUsers.includes(fromId)) {
        currentUsers.push(fromId);
        room.setFlag<PlayerId[]>(
          source,
          WeiLu.WeiLuCurrent,
          currentUsers,
          originalUsers.length > 0 ? undefined : this.Name,
        );
      }
    } else {
      if (!originalUsers.includes(fromId)) {
        originalUsers.push(fromId);
        room.setFlag<PlayerId[]>(source, this.Name, originalUsers, this.Name);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: WeiLu.Name, description: WeiLu.Description })
export class WeiLuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      room.CurrentPlayerPhase === PlayerPhase.PhaseFinish &&
      stage === PhaseChangeStage.PhaseChanged &&
      room
        .getOtherPlayers(owner)
        .find(
          other =>
            other.getFlag<PlayerId[]>(this.GeneralName)?.includes(owner) ||
            other.getFlag<PlayerId[]>(WeiLu.WeiLuCurrent)?.includes(owner),
        ) === undefined
    );
  }

  public async whenDead(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      const users = other.getFlag<PlayerId[]>(this.Name);
      if (users) {
        const index = users.findIndex(user => user === player.Id);
        if (index !== -1) {
          if (users.length === 1) {
            room.removeFlag(other.Id, this.Name);
          } else {
            users.splice(index, 1);
            room.setFlag<PlayerId[]>(other.Id, this.Name, users, this.Name);
          }
        }
      }

      const currentUser = other.getFlag<PlayerId[]>(WeiLu.WeiLuCurrent);
      if (currentUser) {
        const index = currentUser.findIndex(user => user === player.Id);
        if (index !== -1) {
          if (currentUser.length === 1) {
            room.removeFlag(other.Id, this.Name);
          } else {
            currentUser.splice(index, 1);
            room.setFlag<PlayerId[]>(
              other.Id,
              this.Name,
              currentUser,
              other.getFlag<PlayerId[]>(this.Name) ? undefined : this.Name,
            );
          }
        }
      }
    }
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    if (
      room
        .getOtherPlayers(owner.Id)
        .find(
          other =>
            other.getFlag<PlayerId[]>(this.GeneralName)?.includes(owner.Id) ||
            other.getFlag<PlayerId[]>(WeiLu.WeiLuCurrent)?.includes(owner.Id),
        ) === undefined
    ) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        (phaseStageChangeEvent.toStage === PlayerPhaseStages.PlayCardStageStart ||
          phaseStageChangeEvent.toStage === PlayerPhaseStages.PlayCardStageEnd)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.fromPlayer === owner.Id && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const toStage = (unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).toStage;
      if (toStage === PlayerPhaseStages.PlayCardStageStart) {
        for (const other of room.getOtherPlayers(fromId)) {
          const originalUsers = other.getFlag<PlayerId[]>(this.GeneralName);
          if (originalUsers && originalUsers.includes(fromId) && other.Hp > 1) {
            const num = other.Hp - 1;
            await room.loseHp(other.Id, num);
            other.setFlag<number>(this.Name, num);
          }
        }
      } else {
        for (const other of room.getOtherPlayers(fromId)) {
          const num = other.getFlag<number>(this.Name);
          if (num) {
            await room.recover({
              toId: other.Id,
              recoveredHp: num,
              recoverBy: fromId,
            });
            other.removeFlag(this.Name);
          }
        }
      }
    } else {
      for (const other of room.getOtherPlayers(fromId)) {
        const users = other.getFlag<PlayerId[]>(this.GeneralName);
        if (users) {
          const index = users.findIndex(user => user === fromId);
          if (index !== -1) {
            if (users.length === 1) {
              room.removeFlag(other.Id, this.GeneralName);
            } else {
              users.splice(index, 1);
              room.setFlag<PlayerId[]>(other.Id, this.GeneralName, users, this.GeneralName);
            }
          }
        }

        let currentUsers = other.getFlag<PlayerId[]>(WeiLu.WeiLuCurrent);
        if (currentUsers) {
          room.removeFlag(other.Id, WeiLu.WeiLuCurrent);
          const newUsers = other.getFlag<PlayerId[]>(this.GeneralName) || [];
          currentUsers = currentUsers.filter(user => !newUsers.includes(user));
          if (newUsers.length > 0 || currentUsers.length > 0) {
            room.setFlag<PlayerId[]>(other.Id, this.GeneralName, newUsers.concat(currentUsers), this.GeneralName);
          }
        }
      }
    }

    return true;
  }
}
