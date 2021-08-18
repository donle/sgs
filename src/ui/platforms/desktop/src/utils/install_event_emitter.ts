import { EventEmitterProps } from 'core/network/local/event_emitter_props';
import { PlayerId } from 'core/player/player_props';

export function installEventEmitter() {
  if (!(window as any).eventEmitter) {
    (window as any).eventEmitter = EventEmitter.getInstance();
  }
}

export function bindPlayerWithGlobalEventEmitter(playerId: PlayerId) {
  if (!(window as any).eventEmitter) {
    (window as any).eventEmitter = EventEmitter.getInstance();
  }

  (window as any).eventEmitter.bindWithPlayer(playerId);
}

class EventEmitter implements EventEmitterProps {
  private constructor() {}

  private static instace: EventEmitter;
  private emitterForPlayer: PlayerId;

  private onHangingEventCallback: { [K: string]: (...args: any) => void | Promise<void> } = {};

  static getInstance() {
    if (!this.instace) {
      this.instace = new EventEmitter();
    }

    return this.instace;
  }

  public bindWithPlayer(playerId: PlayerId) {
    this.emitterForPlayer = playerId;
  }

  async send(evtName: string, ...args: any) {
    await this.onHangingEventCallback[evtName]?.(...args);
  }

  async emit(to: PlayerId, evtName: string, ...args: any) {
    await this.onHangingEventCallback[evtName]?.(...args);
  }

  on(evtName: string, callback: (...args: any) => void | Promise<void>) {
    this.onHangingEventCallback[evtName] = callback;
  }
}
