import {
  AllGameEvent,
  EventMode,
  EventPicker,
  GameEventIdentifiers,
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

export abstract class Socket<T extends EventMode> {
  constructor(protected eventMode: T) {}

  public abstract sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<
      typeof type,
      T extends EventMode.Client ? EventMode.Server : EventMode.Client
    >,
    to: PlayerId,
  ): void;
}

export type SocketMessage<
  I extends GameEventIdentifiers = GameEventIdentifiers,
  E extends EventMode = EventMode
> = {
  type: I;
  content: EventPicker<I, E>;
};
