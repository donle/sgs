import {
  ClientEventFinder,
  GameEventIdentifiers,
  RoomEvent,
  RoomEventFinder,
  serverActiveListenerEvents,
  ServerEventFinder,
  serverResponsiveListenerEvents,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { Logger } from 'core/shares/libs/logger/logger';
import { HostConfigProps } from 'core/shares/types/host_config';
import { TranslationPack } from 'core/translations/translation_json_tool';
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
      this.clientIds.push(socket.id);

      serverActiveListenerEvents().forEach(identifier => {
        socket.on(
          identifier.toString(),
          (content: ClientEventFinder<typeof identifier>) => {
            switch (identifier) {
              case GameEventIdentifiers.PlayerEnterEvent:
                this.onPlayerEnter(
                  socket,
                  identifier,
                  content as ClientEventFinder<
                    GameEventIdentifiers.PlayerEnterEvent
                  >,
                );
                break;
              case GameEventIdentifiers.PlayerLeaveEvent:
              case GameEventIdentifiers.UserMessageEvent:
              default:
                logger.debug('Not implemented active listener', identifier);
            }
          },
        );
      });

      serverResponsiveListenerEvents().forEach(identifier => {
        socket.on(identifier.toString(), (content: unknown) => {
          const asyncResolver =
            this.asyncResponseResolver[identifier] &&
            this.asyncResponseResolver[identifier][socket.id];
          if (asyncResolver) {
            asyncResolver(content);
            this.asyncResponseResolver[identifier][socket.id] = undefined;
          }
        });
      });

      socket.on('disconnect', () => {
        logger.info('User disconnected', socket.id);
        this.clientIds = this.clientIds.filter(id => id !== socket.id);
        this.room!.removePlayer(socket.id);

        socket.leave(this.roomId);
        socket.disconnect();
        if (this.clientIds.length === 0) {
          this.room && this.room.close();
        }
      });
    });
  }

  private async onPlayerEnter(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerEnterEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    const player = new ServerPlayer(
      socket.id,
      event.playerName,
      room.Players.length,
    );
    room.addPlayer(player);

    this.broadcast(GameEventIdentifiers.PlayerEnterEvent, {
      joiningPlayerName: event.playerName,
      roomInfo: room.getRoomInfo(),
      playersInfo: room.Players.map(player => player.getPlayerInfo()),
      gameInfo: room.Info,
      translationsMessage: TranslationPack.translationJsonPatcher(
        'player {0} join in the room',
        event.playerName,
      ).extract(),
    });

    if (room.Players.length === room.getRoomInfo().totalPlayers) {
      await room.gameStart();
    }
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
