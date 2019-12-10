import {
  AllGameEvent,
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { PlayerId } from 'core/player/player_props';

export interface WebSocketMessageEvent {
  data: string;
  type: string;
  target: any;
}
export interface IWebSocket {
  onmessage(this: WebSocket, ev: WebSocketMessageEvent): any;
  send(
    data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView,
  ): void;
}

export abstract class Socket<T extends WorkPlace> {
  constructor(protected eventMode: T) {}

  public abstract sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<
      typeof type,
      T extends WorkPlace.Client ? WorkPlace.Server : WorkPlace.Client
    >,
    to: PlayerId,
  ): void;
}

export type SocketMessage<
  I extends GameEventIdentifiers = GameEventIdentifiers,
  E extends WorkPlace = WorkPlace
> = {
  type: I;
  content: EventPicker<I, E>;
};
