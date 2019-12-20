import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { Socket, SocketMessage, WebSocketWithId } from 'core/network/socket';
import { PlayerId, PlayerInfo } from 'core/player/player_props';
import { ServerRoom } from 'core/room/room.server';
import { createHash } from 'crypto';
import { Languages } from 'translations/languages';
import * as ServerWebSocket from 'ws';

type SgsWebSocket = WebSocketWithId<ServerWebSocket>;

export class ServerSocket extends Socket<WorkPlace.Server> {
  private socket: ServerWebSocket.Server;
  private room: ServerRoom;
  private clients: SgsWebSocket[];
  private hash = createHash('sha256');

  private asyncPendingEventName: string | undefined;
  private asyncPendingEventResolver: Function;
  private asyncPendingEventRejector: Function;
  private asyncPendingEventPromiseListener = new Promise<any>(
    (resolve, reject) => {
      this.asyncPendingEventResolver = resolve;
      this.asyncPendingEventRejector = reject;
    },
  );

  constructor() {
    super(WorkPlace.Server);

    this.socket = new ServerWebSocket.Server({ noServer: true });
    this.socket.on('connection', (ws: SgsWebSocket, req) => {
      this.hash.update(this.clients.length.toString());
      ws.id = this.hash.digest('latin1');

      ws.on('message', data => {
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
            const { playerLanguage, playerName } = content as EventPicker<
              GameEventIdentifiers.PlayerEnterEvent,
              WorkPlace.Client
            >;

            const playerInfo: PlayerInfo = {
              Id: ws.id,
              Position: this.clients.length - 1,
              Name: playerName,
              CharacterId: undefined,
              Role: undefined,
            };

            playerInfo.Id = ws.id;
            playerInfo.Position = this.clients.length - 1;

            this.room && this.room.createPlayer(playerInfo, playerLanguage);
          }

          this.room.on<typeof type>(type, content);
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
    const clientSocket = this.clients.find(client => client.id === to);
    if (!clientSocket) {
      throw new Error(
        `Unable to find player: ${to} in connected socket clients`,
      );
    }

    clientSocket.send(JSON.stringify({ type, content }));
  }

  broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
  ) {
    this.socket.clients.forEach((client: SgsWebSocket) => {
      client.send(JSON.stringify({ type, content }));
    });
  }

  public getSocketById(id: PlayerId) {
    for (const ws of this.socket.clients as Set<SgsWebSocket>) {
      if (ws.id === id) {
        return ws;
      }
    }
  }

  public notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Server>,
    to: PlayerId,
    pendingMessage?: (language: Languages) => string,
    language?: Languages,
  ) {
    if (pendingMessage && language) {
      content.message = pendingMessage(language);
    }

    const socket = this.getSocketById(to);
    if (socket === undefined) {
      throw new Error(`Unable to find socket for player ${to}`);
    }

    socket.send(JSON.stringify({ type, content }));
  }

  public async waitForResponse<T extends object = {}>(eventName: string) {
    this.asyncPendingEventName = eventName;
    const result = (await this.asyncPendingEventPromiseListener) as T;
    this.asyncPendingEventName = undefined;

    return result;
  }

  public get Clients() {
    return Array.from(this.socket.clients) as SgsWebSocket[];
  }
}
