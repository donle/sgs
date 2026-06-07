import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'core/event/event';
import { Socket } from 'core/network/socket';
import IOSocketClient from 'socket.io-client';

export class ClientSocket extends Socket<WorkPlace.Client> {
  private socketIO: SocketIOClient.Socket;
  private reconnecting: boolean = false;

  constructor(endpoint: string, protected roomId: string) {
    super();
    this.init(endpoint);
  }

  protected init(endpoint: string) {
    this.socketIO = IOSocketClient(endpoint, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    this.socketIO.on('disconnect', reason => {
      if (reason !== 'io client disconnect') {
        this.reconnecting = true;
      }
    });
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ClientEventFinder<I>) {
    this.socketIO.emit(type.toString(), content);
  }

  public on<T extends GameEventIdentifiers>(type: T, receiver: (event: ServerEventFinder<T>) => void): ClientSocket {
    this.socketIO.on(type.toString(), receiver);

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

  public onReconnected(callback: () => void) {
    const handleReconnected = () => {
      if (this.reconnecting) {
        this.reconnecting = false;
        callback();
      }
    };

    this.socketIO.on('reconnect', handleReconnected);
    this.socketIO.on('connect', handleReconnected);
  }

  public disconnect() {
    this.socketIO.disconnect();
    this.socketIO.close();
  }
}
