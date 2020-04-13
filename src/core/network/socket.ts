import {
  ClientEventFinder,
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
  protected abstract roomId: string;

  constructor(protected eventMode: T, protected hostConfig: HostConfigProps) {}

  public abstract async waitForResponse<I extends GameEventIdentifiers>(
    identifier: I,
    playerId?: PlayerId,
  ): Promise<T extends WorkPlace.Client ? ServerEventFinder<I> : ClientEventFinder<I>>;

  public abstract notify<I extends GameEventIdentifiers>(
    type: I,
    content: T extends WorkPlace.Client ? ClientEventFinder<I> : ServerEventFinder<I>,
    to?: PlayerId,
  ): void;
  public abstract broadcast<I extends GameEventIdentifiers>(
    type: I,
    content: T extends WorkPlace.Client ? ClientEventFinder<I> : ServerEventFinder<I>,
  ): void;

  public get RoomId() {
    return this.roomId;
  }
}
