import {
  ClientEventFinder,
  GameEventIdentifiers,
  serverActiveListenerEvents,
  ServerEventFinder,
  serverResponsiveListenerEvents,
  WorkPlace,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { Socket } from 'core/network/socket';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { Logger } from 'core/shares/libs/logger/logger';
import { TranslationPack } from 'core/translations/translation_json_tool';
import IOSocketServer from 'socket.io';

export class ServerSocket extends Socket<WorkPlace.Server> {
  private socket: IOSocketServer.Namespace;
  protected room?: ServerRoom;
  protected roomId: string;

  private asyncResponseResolver: {
    [I in GameEventIdentifiers]: {
      [K in PlayerId]: ((res?: any) => void) | undefined;
    };
  } = {} as any;

  private playerReconnectTimer: { [K in string]: NodeJS.Timer } = {};
  private mapSocketIdToPlayerId: { [K in string]: string } = {};
  private mapPlayerIdToObservers: { [K in string]: string[] } = {};
  private lastResponsiveEvent:
    | {
        to: PlayerId;
        identifier: GameEventIdentifiers;
        event: ServerEventFinder<GameEventIdentifiers>;
      }
    | undefined;
  constructor(socket: IOSocketServer.Namespace, roomId: RoomId, protected logger: Logger) {
    super();
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
            case GameEventIdentifiers.PlayerReenterEvent:
              this.onPlayerReenter(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.PlayerReenterEvent>,
              );
              break;
            case GameEventIdentifiers.PlayerLeaveEvent:
              this.onPlayerLeave(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.PlayerLeaveEvent>,
              );
              break;
            case GameEventIdentifiers.PlayerReadyEvent:
              this.onPlayerReady(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.PlayerReadyEvent>,
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
            case GameEventIdentifiers.BackToWaitingRoomEvent:
              this.onPlayerBackingToWaitingRoom(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.BackToWaitingRoomEvent>,
              );
              break;
            case GameEventIdentifiers.ObserverRequestChangeEvent:
              this.onObserverRequestChangingView(
                socket,
                identifier,
                content as ClientEventFinder<GameEventIdentifiers.ObserverRequestChangeEvent>,
              );
              break;
            default:
              logger.info('Not implemented active listener', identifier);
          }
        });
      });

      serverResponsiveListenerEvents.forEach(identifier => {
        socket.on(identifier.toString(), (content: ClientEventFinder<GameEventIdentifiers>) => {
          const mappedPlayerId = Object.entries(this.mapSocketIdToPlayerId).find(
            ([playerId, socketId]) => socketId === socket.id,
          );
          if (!mappedPlayerId) {
            this.logger.info(`Unable to find playerId of socket ${socket.id}`);
            return;
          }
          const playerId = mappedPlayerId[0];

          content.status && this.room!.updatePlayerStatus(content.status, playerId);

          const asyncResolver =
            this.asyncResponseResolver[identifier] && this.asyncResponseResolver[identifier][playerId];
          if (asyncResolver) {
            asyncResolver(content);
            delete this.asyncResponseResolver[identifier][playerId];
            this.lastResponsiveEvent = undefined;
          }
        });
      });

      socket.on('disconnect', () => {
        logger.info('User disconnected', socket.id);
        socket.leave(this.roomId);

        const mappedPlayerId = Object.entries(this.mapSocketIdToPlayerId).find(
          ([playerId, socketId]) => socketId === socket.id,
        );
        if (!mappedPlayerId) {
          this.logger.info(`Unable to find playerId of socket ${socket.id}`);
          return;
        }
        const playerId = mappedPlayerId[0];

        if (this.room && this.room.Players.find(player => player.Id === playerId) === undefined) {
          return;
        }

        const room = this.room as ServerRoom;
        const player = room.getPlayerById(playerId);
        if (player.isOnline()) {
          player.setOffline();
          this.delayToDisconnect(playerId);
        } else {
          const playerLeaveEvent: ServerEventFinder<GameEventIdentifiers.PlayerLeaveEvent> = {
            playerId,
            quit: true,
            translationsMessage: TranslationPack.translationJsonPatcher(
              'player {0} has left the room',
              room.getPlayerById(playerId).Name,
            ).extract(),
            ignoreNotifiedStatus: true,
          };
          this.broadcast(
            GameEventIdentifiers.PlayerLeaveEvent,
            EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerLeaveEvent, playerLeaveEvent),
          );
        }

        if (room.Players.every(player => !player.isOnline() || player.isSmartAI()) || room.Players.length === 0) {
          this.logger.debug('room close with no player online');
          room.close();
          return;
        }

        if (!room.isPlaying()) {
          room.removePlayer(playerId);
        } else if (this.room?.AwaitingResponseEvent[playerId]) {
          this.logger.debug('Room is Playing, Await Ai Resp');
          const { identifier: awaitIdentifier, content } = this.room?.AwaitingResponseEvent[playerId]!;
          if (awaitIdentifier === undefined) {
            throw new Error(
              `Unknown event without identifier: ${JSON.stringify(this.room?.AwaitingResponseEvent[playerId])}`,
            );
          }
          if ((content as any).toId !== playerId) {
            return;
          }
          const toPlayer = room.getPlayerById(playerId);
          const result = toPlayer.AI.onAction(this.room!, awaitIdentifier, content);
          if (this.asyncResponseResolver[awaitIdentifier][playerId]) {
            this.asyncResponseResolver[awaitIdentifier][playerId]!(result);
            delete this.asyncResponseResolver[awaitIdentifier][playerId];
          }
          this.room.unsetAwaitingResponseEvent(playerId);
        }
      });
    });
  }

  private delayToDisconnect(playerId: PlayerId) {
    this.playerReconnectTimer[playerId] = setTimeout(() => {
      const playerLeaveEvent: ServerEventFinder<GameEventIdentifiers.PlayerLeaveEvent> = {
        playerId,
        quit: true,
        translationsMessage: TranslationPack.translationJsonPatcher(
          'player {0} has left the room',
          this.room!.getPlayerById(playerId).Name,
        ).extract(),
        ignoreNotifiedStatus: true,
      };
      this.broadcast(
        GameEventIdentifiers.PlayerLeaveEvent,
        EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerLeaveEvent, playerLeaveEvent),
      );
      this.room!.getPlayerById(playerId).setOffline(true);
      delete this.mapSocketIdToPlayerId[playerId];
      delete this.playerReconnectTimer[playerId];
    }, 300 * 1000);
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
      this.broadcast(identifier, content as unknown as ServerEventFinder<GameEventIdentifiers.UserMessageEvent>);
    }
  }

  private async onObserverRequestChangingView(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.ObserverRequestChangeEvent,
    content: ClientEventFinder<GameEventIdentifiers.ObserverRequestChangeEvent>,
  ) {
    for (const player of this.room!.Players) {
      if (this.mapPlayerIdToObservers[player.Id]?.includes(content.observerId)) {
        this.mapPlayerIdToObservers[player.Id] = this.mapPlayerIdToObservers[player.Id].filter(
          id => id !== content.observerId,
        );
        break;
      }
    }

    this.mapPlayerIdToObservers[content.toObserverId] = this.mapPlayerIdToObservers[content.toObserverId] || [];
    this.mapPlayerIdToObservers[content.toObserverId].push(content.observerId);
  }

  private async onPlayerBackingToWaitingRoom(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.BackToWaitingRoomEvent,
    content: ClientEventFinder<GameEventIdentifiers.BackToWaitingRoomEvent>,
  ) {
    socket.emit(identifier.toString(), {
      ...this.room!.WaitingRoomInfo,
      playerId: content.playerId,
      playerName: content.playerName,
    });
  }

  private async onPlayerStatusChanged(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerStatusEvent,
    content: ClientEventFinder<GameEventIdentifiers.PlayerStatusEvent>,
  ) {
    this.room!.updatePlayerStatus(content.status, content.toId);
  }

  private async onPlayerReenter(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerReenterEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    if (this.mapSocketIdToPlayerId[event.playerId] !== undefined) {
      this.mapSocketIdToPlayerId[event.playerId] = socket.id;
      clearTimeout(this.playerReconnectTimer[event.playerId]);
      room.getPlayerById(event.playerId).setOnline();
    }

    const missingEvents = this.room!.Analytics.getRecordEvents(e => {
      const timeStamp = EventPacker.getTimestamp(e);
      if (!timeStamp) {
        return false;
      }
      return timeStamp > event.timestamp;
    });
    if (this.lastResponsiveEvent && this.lastResponsiveEvent.to === event.playerId) {
      missingEvents.push(this.lastResponsiveEvent.event);
    }
    socket.emit(GameEventIdentifiers.PlayerBulkPacketEvent.toString(), {
      timestamp: event.timestamp,
      stackedLostMessages: missingEvents,
    });

    this.broadcast(GameEventIdentifiers.PlayerReenterEvent, {
      toId: event.playerId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        'player {0} re-enter in the room',
        TranslationPack.patchPureTextParameter(event.playerName),
      ).extract(),
      ignoreNotifiedStatus: true,
    });
  }

  private async onPlayerEnter(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerEnterEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;

    let joinFailed = false;
    if (event.coreVersion !== Sanguosha.Version) {
      joinFailed = true;
    } else if (!event.joinAsObserver && (room.isPlaying() || room.Info.numberOfPlayers <= room.Players.length)) {
      joinFailed = true;
    }

    if (joinFailed) {
      socket.emit(GameEventIdentifiers.PlayerEnterRefusedEvent.toString(), {
        playerId: event.playerId,
        playerName: event.playerName,
        timestamp: event.timestamp,
      });

      socket.disconnect();
      return;
    }

    this.mapSocketIdToPlayerId[event.playerId] = socket.id;
    if (!event.joinAsObserver) {
      const player = new ServerPlayer(event.playerId, event.playerName, room.Players.length);
      room.addPlayer(player);

      this.broadcast(GameEventIdentifiers.PlayerEnterEvent, {
        joiningPlayerName: event.playerName,
        joiningPlayerId: event.playerId,
        roomInfo: room.getRoomInfo(),
        playersInfo: room.Players.map(p => p.getPlayerInfo()),
        gameInfo: room.Info,
        translationsMessage: TranslationPack.translationJsonPatcher(
          'player {0} join in the room',
          TranslationPack.patchPureTextParameter(event.playerName),
        ).extract(),
        timestamp: event.timestamp,
      });
    } else {
      const observePlayer = room.AlivePlayers[0];
      this.mapPlayerIdToObservers[observePlayer.Id] = this.mapPlayerIdToObservers[observePlayer.Id] || [];
      this.mapPlayerIdToObservers[observePlayer.Id].push(event.playerId);

      this.broadcast(GameEventIdentifiers.ObserverEnterEvent, {
        joiningPlayerName: event.playerName,
        joiningPlayerId: event.playerId,
        roomInfo: room.getRoomShortcutInfo(),
        playersInfo: room.Players.map(p => p.getPlayerShortcutInfo()),
        gameInfo: room.Info,
        translationsMessage: TranslationPack.translationJsonPatcher(
          'observer {0} join in the room',
          TranslationPack.patchPureTextParameter(event.playerName),
        ).extract(),
        timestamp: event.timestamp,
        observePlayerId: observePlayer.Id,
        ignoreNotifiedStatus: true,
      });
    }
  }

  private async onPlayerReady(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerReadyEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    const player = room.Players.find(player => player.Id === event.playerId);
    if (player) {
      player.getReady();
    }

    if (
      room.Players.length === room.getRoomInfo().totalPlayers &&
      room.Players.every(player => player.isSmartAI() || player.isReady())
    ) {
      await room.gameStart();
    }
  }

  private async onPlayerLeave(
    socket: IOSocketServer.Socket,
    identifier: GameEventIdentifiers.PlayerLeaveEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    room.getPlayerById(event.playerId).setOffline(true);
    const playerLeaveEvent: ServerEventFinder<GameEventIdentifiers.PlayerLeaveEvent> = {
      playerId: event.playerId,
      quit: true,
      translationsMessage: TranslationPack.translationJsonPatcher(
        'player {0} has left the room',
        room.getPlayerById(event.playerId).Name,
      ).extract(),
      ignoreNotifiedStatus: true,
    };

    this.broadcast(
      GameEventIdentifiers.PlayerLeaveEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.PlayerLeaveEvent, playerLeaveEvent),
    );
    if (room.Players.every(player => !player.isOnline()) || room.Players.length === 0) {
      room.close();
      return;
    }

    socket.disconnect();
  }

  public emit(room: ServerRoom) {
    if (!this.room) {
      this.room = room;
    }
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>, to: PlayerId) {
    const toPlayer = this.room!.getPlayerById(to);
    this.lastResponsiveEvent = {
      to,
      identifier: type,
      event: content,
    };

    if (!toPlayer.isOnline()) {
      const result = toPlayer.AI.onAction(this.room!, type, content);
      setTimeout(() => {
        const asyncResolver = this.asyncResponseResolver[type] && this.asyncResponseResolver[type][to];
        if (asyncResolver) {
          asyncResolver(result);
          delete this.asyncResponseResolver[type][to];
          this.room?.unsetAwaitingResponseEvent(to);
        }
      }, 1500);
    } else {
      this.room?.setAwaitingResponseEvent(type, content, to);
      this.socket.to(this.mapSocketIdToPlayerId[to]).emit(type.toString(), content);

      const observers = this.mapPlayerIdToObservers[to];
      if (observers) {
        for (const observer of observers) {
          this.socket.to(this.mapSocketIdToPlayerId[observer]).emit(type.toString(), content);
        }
      }
    }
  }

  broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>) {
    this.socket.emit(type.toString(), EventPacker.minifyPayload(content));
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
