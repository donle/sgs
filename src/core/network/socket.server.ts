import {
  ClientEventFinder,
  createGameEventIdentifiersStringList,
  EventPacker,
  EventPicker,
  GameEventIdentifiers,
  RoomEvent,
  RoomEventFinder,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { HostConfigProps } from 'core/shares/types/host_config';
import IOSocketServer from 'socket.io';

export class ServerSocket extends Socket<WorkPlace.Server> {
  private socket: IOSocketServer.Server;
  private room?: ServerRoom;
  private clientIds: string[] = [];
  protected roomPath: string;

  private asyncResponseResolver: {
    [K in PlayerId]: {
      identifier: GameEventIdentifiers;
      resolve(res?: any): void;
    }[];
  };

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
    this.socket.of(this.roomPath).on('connection', socket => {
      const gameEvent: string[] = createGameEventIdentifiersStringList();
      gameEvent.forEach(event => {
        socket.on(event, (content: unknown) => {
          if (EventPacker.isRoomEvent(event as GameEventIdentifiers | RoomEvent)) {
            throw new Error('Server can\'t receive room event');
          }
          const type = parseInt(event, 10) as GameEventIdentifiers;

          const asyncResolver =
            this.asyncResponseResolver[socket.id] &&
            this.asyncResponseResolver[socket.id].filter(
              resolver => resolver.identifier === type,
            );
          if (asyncResolver !== undefined && asyncResolver.length > 0) {
            asyncResolver.forEach(resolver => resolver.resolve(content));
          }
        });
      });

      socket
        .on('connect', () => {
          this.clientIds.push(socket.id);
        })
        .on('disconnect', () => {
          this.clientIds.filter(id => id !== socket.id);
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

  public emitRoomStatus(
    type: RoomEvent,
    content: RoomEventFinder<typeof type>,
  ) {
    this.socket.emit(type, content);
  };

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

  public get ClientIds() {
    return this.clientIds;
  }

  public async waitForResponse<T extends GameEventIdentifiers>(
    identifier: T,
    playerId: PlayerId,
  ) {
    return await new Promise<ClientEventFinder<T>>(resolve => {
      if (!this.asyncResponseResolver[playerId]) {
        this.asyncResponseResolver[playerId] = [
          {
            identifier,
            resolve,
          },
        ];
      } else {
        const resolvers = this.asyncResponseResolver[playerId].filter(
          resolver => resolver.identifier === identifier,
        );
        resolvers.length === 0
          ? this.asyncResponseResolver[playerId].push({
              identifier,
              resolve,
            })
          : resolvers.forEach(resolver => {
              resolver.resolve = resolve;
            });
      }
    });
  }
}
