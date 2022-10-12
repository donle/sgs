import { EventEmitterProps } from 'core/network/local/event_emitter_props';
import { PlayerId } from 'core/player/player_props';

export function installEventEmitter() {
  if (!(window as any).eventEmitter) {
    (window as any).eventEmitter = EventEmitter.getInstance();
  }
}

class EventEmitter implements EventEmitterProps {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  private static instace: EventEmitter;

  private onHangingEventCallback: { [K: string]: (...args: any) => void | Promise<void> } = {};

  static getInstance() {
    if (!this.instace) {
      this.instace = new EventEmitter();
    }

    return this.instace;
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

  disconnect() {
    for (const key of Object.keys(this.onHangingEventCallback)) {
      delete this.onHangingEventCallback[key];
    }

    this.onHangingEventCallback = {};
  }
}
