import {
  ClientEventFinder,
  GameEventIdentifiers,
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
import { Precondition } from 'core/shares/libs/precondition/precondition';
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

  constructor(socket: IOSocketServer.Namespace, roomId: RoomId, private logger: Logger) {
    super(WorkPlace.Server);
    this.roomId = roomId.toString();

    this.socket = socket;
    this.socket.on('connection', socket => {
      this.logger.info('User connected', socket.id);
      serverActiveListenerEvents.forEach(identifier => {
        socket.on(identifier.toString(), (content: ClientEventFinder<typeof identifier>) => {
          switch (identifier) {
            case GameEventIdentifiers.PlayerEnterEvent:
              this.onPlayerEnter(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.PlayerEnterEvent>,
              );
              break;
            case GameEventIdentifiers.PlayerLeaveEvent:
              this.onPlayerLeave(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.PlayerLeaveEvent>,
              );
              break;
            case GameEventIdentifiers.UserMessageEvent:
              this.onPlayerMessage(identifier, content as ClientEventFinder<GameEventIdentifiers.UserMessageEvent>);
              break;
            case GameEventIdentifiers.PlayerStatusEvent:
              this.onPlayerStatusChanged(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.PlayerStatusEvent>,
              );
              break;
            default:
              logger.info('Not implemented active listener', identifier, GameEventIdentifiers.PlayerEnterEvent);
          }
        });
      });

      serverResponsiveListenerEvents.forEach(identifier => {
        socket.on(identifier.toString(), (content: ClientEventFinder<GameEventIdentifiers>) => {
          content.status && this.room!.updatePlayerStatus(content.status, socket.id);

          const asyncResolver =
            this.asyncResponseResolver[identifier] && this.asyncResponseResolver[identifier][socket.id];
          if (asyncResolver) {
            asyncResolver(content);
            delete this.asyncResponseResolver[identifier][socket.id];
          }
        });
      });

      socket.on('disconnect', () => {
        logger.info('User disconnected', socket.id);
        socket.leave(this.roomId);

        if (this.room && this.room.Players.find(player => player.Id === socket.id) === undefined) {
          return;
        }

        this.clientIds = this.clientIds.filter(id => id !== socket.id);
        const room = this.room as ServerRoom;
        room.getPlayerById(socket.id).setOffline();
        if (this.clientIds.length === 0) {
          this.room && this.room.close();
        }

        const playerLeaveEvent: ServerEventFinder<GameEventIdentifiers.PlayerLeaveEvent> = {
          playerId: socket.id,
          translationsMessage: TranslationPack.translationJsonPatcher(
            'player {0} has left the room',
            room.getPlayerById(socket.id).Name,
          ).extract(),
        };
        this.broadcast(GameEventIdentifiers.PlayerLeaveEvent, playerLeaveEvent);

        if (!room.isPlaying()) {
          room.removePlayer(socket.id);
        } else if (this.room?.AwaitingResponseEvent[socket.id]) {
          const { identifier: awaitIdentifier, content } = this.room?.AwaitingResponseEvent[socket.id]!;
          if ((content as any).toId !== socket.id) {
            return;
          }
          const toPlayer = room.getPlayerById(socket.id);
          const result = toPlayer.AI.onAction(this.room!, awaitIdentifier, content);
          if (this.asyncResponseResolver[awaitIdentifier][socket.id]) {
            this.asyncResponseResolver[awaitIdentifier][socket.id]!(result);
            delete this.asyncResponseResolver[awaitIdentifier][socket.id];
          }
          this.room.unsetAwaitingResponseEvent(socket.id);
        }
      });
    });
  }

  private async onPlayerMessage(
    identifier: GameEventIdentifiers.UserMessageEvent,
    content: ClientEventFinder<GameEventIdentifiers.UserMessageEvent>,
  ) {
    const room = this.room as ServerRoom;
    const player = room.getPlayerById(content.playerId);
    if (content.message) {
      (content as any).originalMessage = content.message;
      content.message = TranslationPack.translationJsonPatcher(
        '{0} {1} says: {2}',
        TranslationPack.patchPureTextParameter(player.Name),
        player.CharacterId === undefined ? '' : TranslationPack.patchPlayerInTranslation(player),
        TranslationPack.patchPureTextParameter(content.message),
      ).toString();
      content.ignoreNotifiedStatus = true;
      this.broadcast(identifier, (content as unknown) as ServerEventFinder<GameEventIdentifiers.UserMessageEvent>);
    }
  }

  private async onPlayerStatusChanged(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerStatusEvent,
    content: ClientEventFinder<GameEventIdentifiers.PlayerStatusEvent>,
  ) {
    this.room!.updatePlayerStatus(content.status, socket.id);
  }

  private async onPlayerEnter(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerEnterEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    if (room.Info.numberOfPlayers <= room.Players.length) {
      socket.emit(GameEventIdentifiers.PlayerEnterRefusedEvent.toString(), {
        playerId: socket.id,
        playerName: event.playerName,
        timestamp: event.timestamp,
      });

      socket.disconnect();
      return;
    }

    const player = new ServerPlayer(socket.id, event.playerName, room.Players.length);
    room.addPlayer(player);
    this.clientIds.push(socket.id);

    this.broadcast(GameEventIdentifiers.PlayerEnterEvent, {
      joiningPlayerName: event.playerName,
      joiningPlayerId: socket.id,
      roomInfo: room.getRoomInfo(),
      playersInfo: room.Players.map(p => p.getPlayerInfo()),
      gameInfo: room.Info,
      translationsMessage: TranslationPack.translationJsonPatcher(
        'player {0} join in the room',
        TranslationPack.patchPureTextParameter(event.playerName),
      ).extract(),
      timestamp: event.timestamp,
    });

    if (room.Players.length === room.getRoomInfo().totalPlayers) {
      await room.gameStart();
    }
  }

  private async onPlayerLeave(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerLeaveEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    room.getPlayerById(event.playerId).setOffline();
    this.clientIds = this.clientIds.filter(id => id !== event.playerId);

    socket.disconnect();
  }

  public emit(room: ServerRoom) {
    if (!this.room) {
      this.room = room;
    }
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>, to: PlayerId) {
    const toPlayer = this.room!.getPlayerById(to);
    if (!toPlayer.isOnline()) {
      const result = toPlayer.AI.onAction(this.room!, type, content);
      setTimeout(() => {
        const asyncResolver = this.asyncResponseResolver[type] && this.asyncResponseResolver[type][to];
        if (asyncResolver) {
          asyncResolver(result);
          delete this.asyncResponseResolver[type][to];
          this.room?.unsetAwaitingResponseEvent(to);
        }
      }, 100);
    } else {
      this.room?.setAwaitingResponseEvent(type, content, to);
      const clientSocket = Precondition.exists(
        this.clientIds.find(clientId => clientId === to),
        `Unable to find player: ${to} in connected socket clients`,
      );

      this.socket.to(clientSocket).emit(type.toString(), content);
    }
  }

  broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>) {
    this.socket.emit(type.toString(), content);
  }

  public getSocketById(id: PlayerId) {
    const clientId = Precondition.exists(
      this.clientIds.find(clientId => clientId === id),
      `Unable to find socket: ${id}`,
    );
    return this.socket.to(clientId);
  }

  public get ClientIds() {
    return this.clientIds;
  }

  public clearSubscriber(identifier: GameEventIdentifiers, to: PlayerId) {
    if (this.asyncResponseResolver[identifier]) {
      delete this.asyncResponseResolver[identifier][to];
    }
  }

  public async waitForResponse<T extends GameEventIdentifiers>(identifier: T, playerId: PlayerId) {
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
    }).then(response => {
      this.room?.unsetAwaitingResponseEvent(playerId);
      return response;
    });
  }
}
