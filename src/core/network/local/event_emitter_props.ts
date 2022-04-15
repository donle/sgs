import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { ServerRoom } from 'core/room/room.server';

export type EventEmitterProps = {
  emit(to: string, eventName: string, ...args: any): void;
  send(eventName: string, ...args: any): void;
  on(eventName: string, callback: (...args: any) => void | Promise<void>);
  disconnect(): void;
};

export interface LocalServerEmitterInterface {
  emit(room: ServerRoom): void;
  notify<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>, to: PlayerId): void;
  broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>): void;
  clearSubscriber(identifier: GameEventIdentifiers, to: PlayerId): void;
  waitForResponse<T extends GameEventIdentifiers>(identifier: T, playerId: PlayerId): Promise<ClientEventFinder<T>>;
}
