import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { HostConfigProps } from 'core/shares/types/host_config';

export type WebSocketWithId<T> = T & {
  id: string;
};

export interface WebSocketMessageEvent {
  data: string;
  type: string;
  target: any;
}

export abstract class Socket<T extends WorkPlace> {
  protected abstract roomPath: string;

  constructor(protected eventMode: T, protected hostConfig: HostConfigProps) {}

  public abstract async waitForResponse<I extends GameEventIdentifiers>(
    identifier: I,
    playerId?: PlayerId,
  ): Promise<
    T extends WorkPlace.Client ? ServerEventFinder<I> : ClientEventFinder<I>
  >;

  public abstract sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, T extends T ? WorkPlace.Server : T>,
    to?: PlayerId,
  ): void;

  public get RoomPath() {
    return this.roomPath;
  }
}
