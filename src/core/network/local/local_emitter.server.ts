import {
  ClientEventFinder,
  GameEventIdentifiers,
  serverActiveListenerEvents,
  ServerEventFinder,
  serverResponsiveListenerEvents,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerId } from 'core/player/player_props';
import { ServerRoom } from 'core/room/room.server';
import { Logger } from 'core/shares/libs/logger/logger';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { LocalServerEmitterInterface } from './event_emitter_props';
import { EventEmitterProps } from './event_emitter_props';

export class LocalServerEmitter implements LocalServerEmitterInterface {
  private room: ServerRoom | undefined;
  private playerId: string;
  private asyncResponseResolver: {
    [I in GameEventIdentifiers]: {
      [K in PlayerId]: ((res?: any) => void) | undefined;
    };
  } = {} as any;

  constructor(private socket: EventEmitterProps, private logger: Logger) {
    this.socket = socket;
    serverActiveListenerEvents.forEach(identifier => {
      socket.on('client-' + identifier.toString(), (content: ClientEventFinder<typeof identifier>) => {
        switch (identifier) {
          case GameEventIdentifiers.PlayerEnterEvent:
            this.onPlayerEnter(socket, identifier, content as ClientEventFinder<GameEventIdentifiers.PlayerEnterEvent>);
            break;
          case GameEventIdentifiers.PlayerReenterEvent:
            this.onPlayerReenter(
              socket,
              identifier,
              content as ClientEventFinder<GameEventIdentifiers.PlayerReenterEvent>,
            );
            break;
          case GameEventIdentifiers.PlayerLeaveEvent:
            this.onPlayerLeave(socket, identifier, content as ClientEventFinder<GameEventIdentifiers.PlayerLeaveEvent>);
            break;
          case GameEventIdentifiers.UserMessageEvent:
            this.onPlayerMessage(identifier, content as ClientEventFinder<GameEventIdentifiers.UserMessageEvent>);
            break;
          case GameEventIdentifiers.PlayerReadyEvent:
            this.onPlayerReady(socket, identifier, content as ClientEventFinder<GameEventIdentifiers.PlayerReadyEvent>);
            break;
          case GameEventIdentifiers.PlayerStatusEvent:
            this.onPlayerStatusChanged(
              socket,
              identifier,
              content as ClientEventFinder<GameEventIdentifiers.PlayerStatusEvent>,
            );
            break;
          default:
            this.logger.error('Not implemented active listener', identifier);
        }
      });
    });

    serverResponsiveListenerEvents.forEach(identifier => {
      socket.on('client-' + identifier.toString(), (content: ClientEventFinder<GameEventIdentifiers>) => {
        const asyncResolver =
          this.asyncResponseResolver[identifier] && this.asyncResponseResolver[identifier][this.playerId];
        if (asyncResolver) {
          asyncResolver(content);
          delete this.asyncResponseResolver[identifier][this.playerId];
        }
      });
    });
  }

  private async onPlayerReady(
    socket: EventEmitterProps,
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

  private async onPlayerStatusChanged(
    socket: EventEmitterProps,
    identifier: GameEventIdentifiers.PlayerStatusEvent,
    content: ClientEventFinder<GameEventIdentifiers.PlayerStatusEvent>,
  ) {
    this.room!.updatePlayerStatus(content.status, content.toId);
  }

  private async onPlayerReenter(
    socket: EventEmitterProps,
    identifier: GameEventIdentifiers.PlayerReenterEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    room.getPlayerById(event.playerId).setOnline();

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
    socket: EventEmitterProps,
    identifier: GameEventIdentifiers.PlayerEnterEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
    const player = new ServerPlayer(event.playerId, event.playerName, room.Players.length);
    room.addPlayer(player);
    this.playerId = event.playerId;
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
  }

  private async onPlayerLeave(
    socket: EventEmitterProps,
    identifier: GameEventIdentifiers.PlayerLeaveEvent,
    event: ClientEventFinder<typeof identifier>,
  ) {
    const room = this.room as ServerRoom;
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
    room.getPlayerById(event.playerId).setOffline(true);
    room.close();
    socket.disconnect();
  }

  public emit(room: ServerRoom) {
    if (!this.room) {
      this.room = room;
    }
  }

  public notify<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>, to: PlayerId) {
    const toPlayer = this.room!.getPlayerById(to);
    if (toPlayer.isSmartAI()) {
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
      this.socket.emit(to, 'server-' + type.toString(), content);
    }
  }

  broadcast<I extends GameEventIdentifiers>(type: I, content: ServerEventFinder<I>) {
    this.socket.send('server-' + type.toString(), EventPacker.minifyPayload(content));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public clearSubscriber(identifier: GameEventIdentifiers, to: PlayerId) {}

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
