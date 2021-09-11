import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { ClientSocket } from '../socket.client';
import { EventEmitterProps } from './event_emitter_props';

export class LocalClientEmitter extends ClientSocket {
  constructor(private emitter: EventEmitterProps, roomId: string) {
    super('', roomId);
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ClientEventFinder<I>) {
    this.emitter.send('client-' + type.toString(), content);
  }

  // tslint:disable-next-line: no-empty
  protected init() {}

  public on<T extends GameEventIdentifiers>(type: T, receiver: (event: ServerEventFinder<T>) => void): ClientSocket {
    this.emitter.on('server-' + type.toString(), receiver);

    return this;
  }

  public disconnect() {
    this.emitter.disconnect();
  }

  public async waitForResponse(): Promise<any> {
    throw new Error("Shouldn't call waitForResponse function in client socket");
  }
  public broadcast() {
    throw new Error("Shouldn't call broadcast function in client socket");
  }
  public emitRoomStatus() {
    throw new Error("Shouldn't call emitRoomStatus function in client socket");
  }

  // tslint:disable-next-line: no-empty
  public onReconnected(callback: () => void) {}
}
