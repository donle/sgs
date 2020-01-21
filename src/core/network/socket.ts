import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { HostConfigProps } from 'core/game/host.config';
import { PlayerId } from 'core/player/player_props';
import { Languages } from 'translations/languages';

export type WebSocketWithId<T> = T & {
  id: string;
};

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
  protected abstract roomPath: string;

  constructor(protected eventMode: T, protected hostConfig: HostConfigProps) {}

  public abstract sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<
      typeof type,
      T extends WorkPlace.Client ? WorkPlace.Server : WorkPlace.Client
    >,
    to: PlayerId,
  ): void;

  public abstract broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
    pendingMessage?: (language: Languages) => string,
  );

  public abstract getSocketById(id: PlayerId): any;
  public abstract notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
    to: PlayerId,
    pendingMessage?: (language: Languages) => string,
    language?: Languages,
  ): void;

  public abstract get ClientIds(): string[];
  public abstract async waitForResponse<T extends object = {}>(eventName: string): Promise<T>;

  public get RoomPath() {
    return this.roomPath;
  }
}

export type SocketMessage<
  I extends GameEventIdentifiers = GameEventIdentifiers,
  E extends WorkPlace = WorkPlace
> = {
  type: I;
  content: EventPicker<I, E>;
};
