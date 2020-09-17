import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { ClientSocket } from './socket.client';

export class ClientOfflineSocket extends ClientSocket {
  constructor(roomId: string) {
    super('', roomId);
    this.socketIO = undefined as any;
  }

  // tslint:disable-next-line:no-empty
  protected init() {}
  // tslint:disable-next-line:no-empty
  public notify<I extends GameEventIdentifiers>(type: I, content: ClientEventFinder<I>) {}

  public on<T extends GameEventIdentifiers>(type: T, receiver: (event: ServerEventFinder<T>) => void): ClientSocket {
    return this;
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

  // tslint:disable-next-line:no-empty
  public onReconnected(callback: () => void) {}

  // tslint:disable-next-line:no-empty
  public disconnect() {}
}
