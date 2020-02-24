import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { HostConfigProps } from 'core/shares/types/host_config';
import {
  RoomSocketEvent,
  RoomSocketEventPicker,
  RoomSocketEventResponser,
} from 'core/shares/types/server_types';
import IOSocketClient from 'socket.io-client';

export class ClientSocket extends Socket<WorkPlace.Client> {
  protected roomId: string;
  private socketIO: SocketIOClient.Socket;

  constructor(config: HostConfigProps, roomId: number) {
    super(WorkPlace.Client, config);

    this.roomId = roomId.toString();
    this.socketIO = IOSocketClient(
      `${config.protocol}://${config.host}:${config.port}/room-${roomId}`,
    );

  }

  public notify<I extends RoomSocketEvent>(
    type: I,
    content: RoomSocketEventPicker<I>,
  ): void;
  public notify<I extends GameEventIdentifiers>(
    type: I,
    content: ClientEventFinder<I>,
  ): void;
  public notify<I extends GameEventIdentifiers | RoomSocketEvent>(
    type: I,
    content: I extends GameEventIdentifiers
      ? ClientEventFinder<I>
      : I extends RoomSocketEvent
      ? RoomSocketEventPicker<I>
      : never,
  ) {
    this.socketIO.emit(type.toString(), content);
  }

  public on<T extends GameEventIdentifiers>(
    type: T,
    receiver: (event: ServerEventFinder<T>) => void,
  ): ClientSocket;
  public on<T extends RoomSocketEvent>(
    type: T,
    receiver: (event: RoomSocketEventResponser<T>) => void,
  ): ClientSocket;
  public on<T extends GameEventIdentifiers | RoomSocketEvent>(
    type: T,
    receiver: (
      event: T extends GameEventIdentifiers
        ? ServerEventFinder<T>
        : T extends RoomSocketEvent
        ? RoomSocketEventResponser<T>
        : never,
    ) => void,
  ): ClientSocket {
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
