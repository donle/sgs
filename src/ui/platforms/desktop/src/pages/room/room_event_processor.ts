import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { RoomPresenter } from './room.presenter';

export class RoomEventProcessor {
  private static instance: RoomEventProcessor;
  private constructor() {}

  public static get Instance() {
    if (this.instance === undefined) {
      this.instance = new RoomEventProcessor();
    }

    return this.instance;
  }

  public onHandleIncomingEvent<T extends GameEventIdentifiers>(
    identifier: T,
    event: ServerEventFinder<T>,
    presenter: RoomPresenter,
  ) {
    console.log(identifier, event);
  }
}
