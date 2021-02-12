import { PlayerId } from 'core/player/player_props';

export type TargetGroup = readonly PlayerId[][];

export class TargetGroupUtil {
  public static getAllTargets(targetGroup?: TargetGroup): PlayerId[][] | undefined {
    if (!targetGroup) {
      return undefined;
    }
    return targetGroup.slice();
  }

  public static getRealTargets(targetGroup?: TargetGroup): PlayerId[] {
    return targetGroup?.map(ids => ids[0]) || [];
  }

  public static includeRealTarget(targetGroup: TargetGroup | undefined, playerId: PlayerId): boolean {
    return !!targetGroup?.find(ids => ids[0] === playerId);
  }

  public static filterTargets(targetGroup: TargetGroup, playerIds: PlayerId[]): TargetGroup {
    return targetGroup.filter((ids: PlayerId[]) => !playerIds.includes(ids[0]));
  }

  public static removeTarget(targetGroup: TargetGroup, playerId: PlayerId): void {
    const idx = targetGroup.findIndex(ids => ids[0] === playerId);
    idx !== -1 && (targetGroup as PlayerId[][]).splice(idx, 1);
  }

  public static pushTargets(targetGroup: TargetGroup, playerIds: PlayerId[] | PlayerId): void {
    if (playerIds instanceof Array) {
      (targetGroup as PlayerId[][]).push(playerIds);
    } else {
      (targetGroup as PlayerId[][]).push([playerIds]);
    }
  }
}
