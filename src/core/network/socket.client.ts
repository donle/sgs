import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'core/event/event';
import { Socket } from 'core/network/socket';
import IOSocketClient, { Manager } from 'socket.io-client';

export class ClientSocket extends Socket<WorkPlace.Client> {
  protected socketIO: SocketIOClient.Socket;
  private reconnecting: boolean = false;
  private manager: SocketIOClient.Manager;

  constructor(endpoint: string, protected roomId: string) {
    super(WorkPlace.Client);
    this.init(endpoint);
  }

  protected init(endpoint: string) {
    this.socketIO = IOSocketClient(endpoint);
    this.manager = new Manager(endpoint, {
      reconnection: true,
      reconnectionAttempts: 3,
      timeout: 60000,
      autoConnect: true,
    });
    this.socketIO.on('reconnect', () => {
      this.reconnecting = true;
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
    this.socketIO.on('connect', () => {
      if (this.reconnecting) {
        this.reconnecting = false;
        callback();
      }
    });
  }

  public disconnect() {
    this.socketIO.disconnect();
    this.socketIO.close();
  }
}
