import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Room } from 'core/room/room';

export class PlayerAI {
  private static instance: PlayerAI;
  private constructor() {}

  public static get Instance() {
    if (!PlayerAI.instance) {
      PlayerAI.instance = new PlayerAI();
    }

    return PlayerAI.instance;
  }

  onAction<T extends GameEventIdentifiers>(room: Room, e: T, content: ServerEventFinder<T>): ClientEventFinder<T> {
    //TODO: fulfil the basic user actions
    return {} as any;
  }
}
