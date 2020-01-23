import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { HostConfigProps } from 'core/game/host.config';
import { Socket, SocketMessage } from 'core/network/socket';
import { PlayerId, PlayerInfo } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
// import { createHash } from 'crypto';
import IOSocketServer from 'socket.io';

export class ServerSocket extends Socket<WorkPlace.Server> {
  private socket: IOSocketServer.Server;
  private room?: ServerRoom;
  private clientIds: string[] = [];
  protected roomPath: string;

  private asyncPendingEventName: string | undefined;
  private asyncPendingEventResolver: Function;
  private asyncPendingEventRejector: Function;
  private asyncPendingEventPromiseListener = new Promise<any>(
    (resolve, reject) => {
      this.asyncPendingEventResolver = resolve;
      this.asyncPendingEventRejector = reject;
    },
  );

  constructor(config: HostConfigProps, roomId: RoomId) {
    super(WorkPlace.Server, config);
    this.roomPath = `/room-${roomId}`;

    this.socket = IOSocketServer();
    this.socket.of(this.roomPath).clients((error: any, clients: string[]) => {
      if (error) {
        throw new Error(error);
      }

      this.clientIds = clients;
    });
    this.socket.of(this.roomPath).on('connect', socket => {
      // this.hash.update(this.clients.length.toString());
      // socket.id = this.hash.digest('latin1');

      socket.on('message', data => {
        const { type, content } = JSON.parse(data as string) as SocketMessage<
          GameEventIdentifiers,
          WorkPlace.Client
        >;

        if (this.room !== undefined) {
          if (type === GameEventIdentifiers.AskForInvokeEvent) {
            const { eventName } = content as EventPicker<
              GameEventIdentifiers.AskForInvokeEvent,
              WorkPlace.Client
            >;
            eventName === this.asyncPendingEventName
              ? this.asyncPendingEventResolver(content)
              : this.asyncPendingEventRejector('Mis-match invoke event name');

            return;
          }

          if (type === GameEventIdentifiers.PlayerEnterEvent) {
            const { playerName } = content as EventPicker<
              GameEventIdentifiers.PlayerEnterEvent,
              WorkPlace.Client
            >;

            const playerInfo: PlayerInfo = {
              Id: socket.id,
              Position: this.clientIds.length - 1,
              Name: playerName,
              CharacterId: undefined,
              Role: undefined,
            };

            playerInfo.Id = socket.id;
            playerInfo.Position = this.clientIds.length - 1;

            this.room && this.room.createPlayer(playerInfo);
          }

          this.room.on(type, content);
        }
      });
    });
  }

  public emit(room: ServerRoom) {
    if (!this.room) {
      this.room = room;
    }
  }

  public sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
    to: PlayerId,
  ) {
    const clientSocket = this.clientIds.find(clientId => clientId === to);
    if (!clientSocket) {
      throw new Error(
        `Unable to find player: ${to} in connected socket clients`,
      );
    }

    this.socket.to(clientSocket).emit(type.toString(), content);
  }

  broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
  ) {
    this.socket.emit(type.toString(), content);
  }

  public getSocketById(id: PlayerId) {
    const clientId = this.clientIds.find(clientId => clientId === id);
    if (clientId !== undefined) {
      return this.socket.to(clientId);
    }

    throw new Error(`Unable to find socket: ${id}`);
  }

  public notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
    to: PlayerId,
  ) {
    const socket = this.getSocketById(to);
    if (socket === undefined) {
      throw new Error(`Unable to find socket for player ${to}`);
    }

    socket.emit(type.toString(), content);
  }

  public async waitForResponse<T extends object = {}>(eventName: string) {
    this.asyncPendingEventName = eventName;
    const result = (await this.asyncPendingEventPromiseListener) as T;
    this.asyncPendingEventName = undefined;

    return result;
  }

  public get ClientIds() {
    return this.clientIds;
  }
}
