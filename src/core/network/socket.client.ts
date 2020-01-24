import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { Socket } from 'core/network/socket';
import { HostConfigProps } from 'core/shares/types/host_config';
import IOSocketClient from 'socket.io-client';

export abstract class ClientSocket extends Socket<WorkPlace.Client> {
  protected roomPath: string;
  private socketIO: SocketIOClient.Socket;

  constructor(config: HostConfigProps, roomId: string) {
    super(WorkPlace.Client, config);

    this.roomPath = `/room-${roomId}`;
    this.socketIO = IOSocketClient(
      `${config.protocal}://${config.host}:${config.port}`,
      { path: this.roomPath },
    );

    //TODO: add gameEvent names here
    const gameEvent: string[] = [];
    gameEvent.forEach(event => {
      this.socketIO.on(event, (content: unknown) => {
        const type = parseInt(event, 10) as GameEventIdentifiers;
        this.on(type, content as EventPicker<typeof type, WorkPlace.Client>);
      });
    });
  }

  public sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
  ) {
    this.socketIO.send(JSON.stringify({ type, content }));
  }
}
