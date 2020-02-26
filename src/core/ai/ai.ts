import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';

export class PlayerAI {
  private static instance: PlayerAI;
  private constructor() {}

  public static get Instance() {
    if (!PlayerAI.instance) {
      PlayerAI.instance = new PlayerAI();
    }

    return PlayerAI.instance;
  }

  onAction<T extends GameEventIdentifiers>(
    e: T,
    content: ServerEventFinder<T>,
  ) {
    //TODO: fulfil the basic user actions
  }
}
