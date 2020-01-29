import {
  createGameEventIdentifiersStringList,
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { PlayerId, PlayerInfo } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { HostConfigProps } from 'core/shares/types/host_config';
import IOSocketServer from 'socket.io';

export class ServerSocket extends Socket<WorkPlace.Server> {
  private socket: IOSocketServer.Server;
  private room?: ServerRoom;
  private clientIds: string[] = [];
  protected roomPath: string;

  private asyncEventIdentifier: GameEventIdentifiers | undefined;
  private asyncResponseResolver: <T>(res: T) => void;
  private receivedAsyncResponse: Promise<any> = new Promise(resolve => {
    this.asyncResponseResolver = resolve;
  });

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
          const type = parseInt(event, 10) as GameEventIdentifiers;

          if (this.asyncEventIdentifier === type) {
            this.asyncResponseResolver(content);
          }

          const params: any[] = [];
          if (type === GameEventIdentifiers.PlayerEnterEvent) {
            params.push(socket.id);
          }
          this.on(
            type,
            content as EventPicker<typeof type, WorkPlace.Client>,
            ...params,
          );
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

  public async waitForResponse<T>(identifier: GameEventIdentifiers) {
    this.asyncEventIdentifier = identifier;

    return await this.receivedAsyncResponse as T;
  }

  //TODO: socket event handlers
  public userMessage(
    ev: EventPicker<GameEventIdentifiers.UserMessageEvent, WorkPlace.Client>,
  ): void {}

  public gameOver(
    ev: EventPicker<GameEventIdentifiers.GameOverEvent, WorkPlace.Client>,
  ): void {}
  public gameStart(
    ev: EventPicker<GameEventIdentifiers.GameStartEvent, WorkPlace.Client>,
  ): void {}
  public playerEnter(
    ev: EventPicker<GameEventIdentifiers.PlayerEnterEvent, WorkPlace.Client>,
    ...params: any[]
  ): void {
    const { playerName } = ev;
    const [id] = params;

    const playerInfo: PlayerInfo = {
      Id: id,
      Position: this.clientIds.length - 1,
      Name: playerName,
      CharacterId: undefined,
      Role: undefined,
    };

    (playerInfo.Id = id), (playerInfo.Position = this.clientIds.length - 1);

    this.room && this.room.createPlayer(playerInfo);
  }
  public playerLeave(
    ev: EventPicker<GameEventIdentifiers.PlayerLeaveEvent, WorkPlace.Client>,
  ): void {}
  public playerDied(
    ev: EventPicker<GameEventIdentifiers.PlayerDiedEvent, WorkPlace.Client>,
  ): void {}

  public useCard(
    ev: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Client>,
  ): void {}
  public dropCard(
    ev: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Client>,
  ): void {}
  public responseCard(
    ev: EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace.Client>,
  ): void {}
  public drawCard(
    ev: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Client>,
  ): void {}
  public obtainCard(
    ev: EventPicker<GameEventIdentifiers.ObtainCardEvent, WorkPlace.Client>,
  ): void {}
  public moveCard(
    ev: EventPicker<GameEventIdentifiers.MoveCardEvent, WorkPlace.Client>,
  ): void {}

  public useSkill(
    ev: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Client>,
  ): void {}
  public pinDian(
    ev: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Client>,
  ): void {}
  public damage(
    ev: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Client>,
  ): void {}
  public judge(
    ev: EventPicker<GameEventIdentifiers.JudgeEvent, WorkPlace.Client>,
  ): void {}
  public invokeSkill(
    ev: EventPicker<GameEventIdentifiers.AskForInvokeEvent, WorkPlace.Client>,
  ): void {}

  public onCardEffect(
    ev: EventPicker<GameEventIdentifiers.CardEffectEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public displayCard(
    ev: EventPicker<GameEventIdentifiers.CardDisplayEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onAim(
    ev: EventPicker<GameEventIdentifiers.AimEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onAimmed(
    ev: EventPicker<GameEventIdentifiers.AimmedEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onRecover(
    ev: EventPicker<GameEventIdentifiers.RecoverEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onDying(
    ev: EventPicker<GameEventIdentifiers.PlayerDyingEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onAskingForPeach(
    ev: EventPicker<GameEventIdentifiers.AskForPeachEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onAskingForWuXieKeJi(
    ev: EventPicker<
      GameEventIdentifiers.AskForWuXieKeJiEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
  public onAskingForCardResponse(
    ev: EventPicker<
      GameEventIdentifiers.AskForCardResponseEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
  public onAskingForCardUse(
    ev: EventPicker<GameEventIdentifiers.AskForCardUseEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onAskingForCardDisplay(
    ev: EventPicker<
      GameEventIdentifiers.AskForCardDisplayEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
  public onAskingForCardDrop(
    ev: EventPicker<GameEventIdentifiers.AskForCardDropEvent, WorkPlace.Client>,
    ...params
  ): void {}
  public onAskingForPinDianCard(
    ev: EventPicker<
      GameEventIdentifiers.AskForPinDianCardEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
  public onAskingForChoosingCard(
    ev: EventPicker<
      GameEventIdentifiers.AskForChoosingCardEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
  public onAskingForChoosingOptions(
    ev: EventPicker<
      GameEventIdentifiers.AskForChooseOptionsEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
  public onAskingForChoosingCardFromPlayer(
    ev: EventPicker<
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      WorkPlace
    >,
    ...params
  ): void {}
  public onAskingForChooseCharacter(
    ev: EventPicker<
      GameEventIdentifiers.AskForChooseCharacterEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
  public onAskingForPlaceCardsInDile(
    ev: EventPicker<
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      WorkPlace.Client
    >,
    ...params
  ): void {}
}
