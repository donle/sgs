import {
  createGameEventIdentifiersStringList,
  EventPicker,
  GameEventIdentifiers,
  RoomEvent,
  RoomEventFinder,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { HostConfigProps } from 'core/shares/types/host_config';
import IOSocketClient from 'socket.io-client';

export class ClientSocket extends Socket<WorkPlace.Client> {
  protected roomPath: string;
  private socketIO: SocketIOClient.Socket;
  //TODO: async message
  private asyncEventIdentifier: GameEventIdentifiers | undefined;
  private asyncResponseResolver: (res: any) => void;

  constructor(config: HostConfigProps, roomId: string) {
    super(WorkPlace.Client, config);

    this.roomPath = `/room-${roomId}`;
    this.socketIO = IOSocketClient(
      `${config.protocal}://${config.host}:${config.port}`,
      { path: this.roomPath },
    );

    const gameEvent: string[] = createGameEventIdentifiersStringList();
    gameEvent.forEach(event => {
      this.socketIO.on(event, (content: unknown) => {
        const type = parseInt(event, 10) as GameEventIdentifiers;
        if (type === this.asyncEventIdentifier) {
          this.asyncResponseResolver && this.asyncResponseResolver(content);
          this.asyncEventIdentifier = undefined;
        }
      });
    });
  }

  public async waitForResponse<T>(identifier: GameEventIdentifiers) {
    this.asyncEventIdentifier = identifier;
    return await new Promise<T>(resolve => {
      this.asyncResponseResolver = resolve;
    });
  }

  public sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
  ) {
    this.socketIO.emit(type.toString(), content);
  }

  public broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
  ) {
    throw new Error("Shouldn't call broadcast function in client socket");
  }
  public emitRoomStatus<T extends RoomEvent>(
    type: T,
    content: RoomEventFinder<T>,
  ) {
    throw new Error("Shouldn't call emitRoomStatus function in client socket");
  }
}
