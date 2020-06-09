import { PlayerId } from 'core/player/player_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';

export type Point = {
  x: number;
  y: number;
};

export class AnimationPosition {
  private positions:
    | {
        playerId: PlayerId;
        position?: Point;
      }[]
    | undefined;

  constructor() {
    document.addEventListener('resize', () => {
      this.positions = undefined;
    });
  }

  insertPlayer(playerId: PlayerId) {
    this.positions = this.positions || [];
    this.positions.push({ playerId });
  }

  private calculatePlayerPosition(playerId: PlayerId) {
    const playerCardElement = Precondition.exists(
      document.getElementById(playerId),
      `Unrendered player card of ${playerId}`,
    );
    const playerOffset = this.getOffset(playerCardElement);
    const position = {
      x: playerOffset.left + playerCardElement.clientWidth / 2,
      y: playerOffset.top + playerCardElement.clientHeight / 2,
    };

    this.positions = this.positions || [];
    const existingPosition = this.positions.find(position => position.playerId === playerId);
    if (existingPosition) {
      existingPosition.position = position;
    } else {
      this.positions.push({
        playerId,
        position,
      });
    }
  }

  private calculateCurrentPlayerPosition(playerId: PlayerId) {
    const playerCardElement = Precondition.exists(
      document.getElementById(playerId),
      `Unrendered player card of ${playerId}`,
    );
    const playerOffset = this.getOffset(playerCardElement);
    const position = {
      x: playerOffset.left + playerCardElement.clientWidth / 2,
      y: playerOffset.top + 12,
    };

    this.positions = this.positions || [];
    const existingPosition = this.positions.find(position => position.playerId === playerId);
    if (existingPosition) {
      existingPosition.position = position;
    } else {
      this.positions.push({
        playerId,
        position,
      });
    }
  }

  private getOffset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
    };
  }

  public getPosition(playerId: PlayerId, isCurrentPlayer?: boolean) {
    isCurrentPlayer ? this.calculateCurrentPlayerPosition(playerId) : this.calculatePlayerPosition(playerId);

    return Precondition.exists(
      this.positions!.find(position => position.playerId === playerId),
      `player ${playerId} not found`,
    ).position!;
  }
}
