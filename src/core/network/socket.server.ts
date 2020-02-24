import {
  ClientEventFinder,
  createGameEventIdentifiersStringList,
  EventPacker,
  EventPicker,
  GameEventIdentifiers,
  RoomEvent,
  RoomEventFinder,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { Logger } from 'core/shares/libs/logger/logger';
import { HostConfigProps } from 'core/shares/types/host_config';
import {
  RoomSocketEvent,
  RoomSocketEventPicker,
  RoomSocketEventResponser,
} from 'core/shares/types/server_types';
import IOSocketServer from 'socket.io';

export class ServerSocket extends Socket<WorkPlace.Server> {
  private socket: IOSocketServer.Namespace;
  private room?: ServerRoom;
  private clientIds: string[] = [];
  protected roomId: string;

  private asyncResponseResolver: {
    [I in GameEventIdentifiers]: {
      [K in PlayerId]: ((res?: any) => void) | undefined;
    };
  } = {} as any;

  constructor(
    config: HostConfigProps,
    socket: IOSocketServer.Namespace,
    roomId: RoomId,
    logger: Logger,
  ) {
    super(WorkPlace.Server, config);
    this.roomId = roomId.toString();

    this.socket = socket;
    this.socket.on('connection', socket => {
      logger.info('User connected', socket.id);

      socket.on(
        RoomSocketEvent.JoinRoom,
        async (event: RoomSocketEventPicker<RoomSocketEvent.JoinRoom>) => {
          const room = this.room as ServerRoom;
          const player = new ServerPlayer(
            socket.id,
            event.playerName,
            room.Players.length,
          );
          // this.clientIds.push(socket.id);
          room.addPlayer(player);

          this.socket.emit(RoomSocketEvent.JoinRoom, {
            roomInfo: room.getRoomInfo(),
            playersInfo: room.Players.map(player => player.getPlayerInfo()),
            gameInfo: room.Info,
          });

          if (room.Players.length === room.getRoomInfo().totalPlayers) {
            const event: RoomSocketEventResponser<RoomSocketEvent.GameStart> = {
              gameStartInfo: {
                numberOfDrawStack: room.DrawStack.length,
                round: 0,
                currentPlayerId: room.Players[0].Id,
              },
              playersInfo: room.Players.map(player => player.getPlayerInfo()),
            };
            this.socket.emit(RoomSocketEvent.GameStart, event);

            await room.gameStart();
          }
        },
      );

      const gameEvent: string[] = createGameEventIdentifiersStringList();
      gameEvent.forEach(event => {
        socket.on(event, (content: unknown) => {
          const identifier = parseInt(event, 10);
          if (Number.isNaN(identifier)) {
            throw new Error("Server can't receive room event");
          }

          const type = identifier as GameEventIdentifiers;

          const asyncResolver =
            this.asyncResponseResolver[type] &&
            this.asyncResponseResolver[type][socket.id];
          if (asyncResolver) {
            asyncResolver(content);
            this.asyncResponseResolver[type][socket.id] = undefined;
          }
        });
      });

      socket
        .on('connect', () => {
          this.clientIds.push(socket.id);
        })
        .on('disconnect', () => {
          this.clientIds.filter(id => id !== socket.id);
          socket.leave(this.roomId);
          socket.disconnect();
          if (this.clientIds.length === 0) {
            this.room && this.room.close();
          }
        });
    });
  }

  public emit(room: ServerRoom) {
    if (!this.room) {
      this.room = room;
    }
  }

  public notify<I extends GameEventIdentifiers>(
    type: I,
    content: ServerEventFinder<I>,
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

  broadcast<I extends GameEventIdentifiers>(
    type: I,
    content: ServerEventFinder<I>,
  ) {
    this.socket.emit(type.toString(), content);
  }

  public emitRoomStatus(
    type: RoomEvent,
    content: RoomEventFinder<typeof type>,
  ) {
    this.socket.emit(type, content);
  }

  public getSocketById(id: PlayerId) {
    const clientId = this.clientIds.find(clientId => clientId === id);
    if (clientId !== undefined) {
      return this.socket.to(clientId);
    }

    throw new Error(`Unable to find socket: ${id}`);
  }

  public get ClientIds() {
    return this.clientIds;
  }

  public async waitForResponse<T extends GameEventIdentifiers>(
    identifier: T,
    playerId: PlayerId,
  ) {
    return await new Promise<ClientEventFinder<T>>(resolve => {
      if (!this.asyncResponseResolver[identifier]) {
        this.asyncResponseResolver[identifier] = {
          [playerId]: resolve,
        };
      } else {
        const identifierResolvers = this.asyncResponseResolver[identifier] as {
          [x: string]: (res?: any) => void;
        };
        identifierResolvers[playerId] = resolve;
      }
    });
  }
}
