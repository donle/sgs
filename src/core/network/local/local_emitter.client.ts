import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventEmitterProps } from './event_emitter_props';
import { ClientSocket } from '../socket.client';

export class LocalClientEmitter extends ClientSocket {
  constructor(private emitter: EventEmitterProps, roomId: string) {
    super('', roomId);
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ClientEventFinder<I>) {
    this.emitter.send('client-' + type.toString(), content);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public onReconnected(callback: () => void) {}
}
