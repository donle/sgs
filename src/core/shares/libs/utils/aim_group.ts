import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from './target_group';

export const enum AimStatus {
  Undone,
  Done,
  Cancelled,
}
export type AimGroup = { [K in AimStatus]: PlayerId[] };

export class AimGroupUtil {
  public static initAimGroup(playerIds: PlayerId[]): AimGroup {
    return { [AimStatus.Undone]: playerIds, [AimStatus.Done]: [], [AimStatus.Cancelled]: [] };
  }

  public static getAllTargets(aimGroup: AimGroup): PlayerId[] {
    return [...aimGroup[AimStatus.Undone], ...aimGroup[AimStatus.Done]].reduce<PlayerId[]>((targets, target) => {
      targets.includes(target) || targets.push(target);
      return targets;
    }, []);
  }

  public static getUndoneOrDoneTargets(aimGroup: AimGroup, done?: boolean): PlayerId[] {
    return done ? aimGroup[AimStatus.Done] : aimGroup[AimStatus.Undone];
  }

  public static setTargetDone(aimGroup: AimGroup, playerId: PlayerId) {
    const index = aimGroup[AimStatus.Undone].findIndex(id => id === playerId);
    if (index !== -1) {
      aimGroup[AimStatus.Undone].splice(index, 1);
      aimGroup[AimStatus.Done].push(playerId);
    } 
  }

  public static addTargets(
    room: Room,
    aimEvent: ServerEventFinder<GameEventIdentifiers.AimEvent>,
    playerIds: PlayerId | PlayerId[],
  ) {
    const playerId = playerIds instanceof Array ? playerIds[0] : playerIds;
    aimEvent.allTargets[AimStatus.Undone].push(playerId);
    room.sortPlayersByPosition(aimEvent.allTargets[AimStatus.Undone]);
    aimEvent.targetGroup && TargetGroupUtil.pushTargets(aimEvent.targetGroup, playerIds);
  }

  public static cancelTarget(aimEvent: ServerEventFinder<GameEventIdentifiers.AimEvent>, playerId: PlayerId) {
    for (const key of Object.keys(aimEvent.allTargets)) {
      aimEvent.allTargets[key] = (aimEvent.allTargets[key] as PlayerId[]).filter(id => id !== playerId);
    }
    aimEvent.allTargets[AimStatus.Cancelled].push(playerId);
    aimEvent.targetGroup && TargetGroupUtil.removeTarget(aimEvent.targetGroup, playerId);
  }

  public static removeDeadTargets(room: Room, aimEvent: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    aimEvent.allTargets[AimStatus.Undone] = room.deadPlayerFilters(aimEvent.allTargets[AimStatus.Undone]);
    aimEvent.allTargets[AimStatus.Done] = room.deadPlayerFilters(aimEvent.allTargets[AimStatus.Done]);
    if (aimEvent.targetGroup) {
      const targets = TargetGroupUtil.getRealTargets(aimEvent.targetGroup);
      for (const target of targets) {
        if (room.getPlayerById(target).Dead) {
          TargetGroupUtil.removeTarget(aimEvent.targetGroup, target);
        }
      }
    }
  }

  public static getCancelledTargets(aimGroup: AimGroup) {
    return aimGroup[AimStatus.Cancelled];
  }
}
