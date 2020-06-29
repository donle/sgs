import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder, WorkPlace } from 'core/event/event';
import { Socket } from 'core/network/socket';
import { HostConfigProps } from 'core/shares/types/host_config';
import IOSocketClient, { Manager } from 'socket.io-client';

export class ClientSocket extends Socket<WorkPlace.Client> {
  protected roomId: string;
  private socketIO: SocketIOClient.Socket;
  private manager: SocketIOClient.Manager;

  constructor(config: HostConfigProps, roomId: number) {
    super(WorkPlace.Client, config);

    this.roomId = roomId.toString();
    const endpoint = `${config.protocol}://${config.host}:${config.port}/room-${roomId}`;
    this.socketIO = IOSocketClient(endpoint);
    this.manager = new Manager(endpoint, {
      reconnection: true,
      reconnectionAttempts: 3,
      timeout: 60000,
    });
    this.manager.open();
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

  public disconnect() {
    this.socketIO.disconnect();
    this.socketIO.close();
  }
}
