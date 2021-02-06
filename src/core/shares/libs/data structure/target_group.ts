import { PlayerId } from 'core/player/player_props';

export class TargetGroupSet {
  public targets: PlayerId[][];

  constructor(...targets: PlayerId[][]) {
    this.targets = [];
    targets && this.targets.push(...targets);
  }

  get Targets(): PlayerId[][] {
    return this.targets.slice();
  }

  get length() {
    return this.targets.length;
  }

  public push(playerIds: PlayerId | PlayerId[]) {
    if (playerIds instanceof Array) {
      if (playerIds.length === 0) {
        return;
      }
      this.targets.push(playerIds);
    } else {
      this.targets.push([playerIds as PlayerId]);
    }
  }

  public includes(playerId: PlayerId): boolean {
    return !!this.targets.find(ids => ids[0] === playerId);
  }

  public remove(playerId: PlayerId): void {
    this.targets = this.targets.filter(ids => ids[0] !== playerId);
  }

  public getRealTargetIds() {
    return this.targets.map(ids => ids[0]);
  }
}
