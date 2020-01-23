import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { HostConfigProps } from 'core/game/host.config';
import { Socket, SocketMessage } from 'core/network/socket';
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

  protected on<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<typeof type, WorkPlace.Client>,
  ) {
    switch (type) {
      case GameEventIdentifiers.UserMessageEvent:
        this.userMessage(
          content as EventPicker<
            GameEventIdentifiers.UserMessageEvent,
            WorkPlace.Server
          >,
        );
        break;

      case GameEventIdentifiers.CardUseEvent:
        this.useCard(
          content as EventPicker<
            GameEventIdentifiers.CardUseEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.CardDropEvent:
        this.dropCard(
          content as EventPicker<
            GameEventIdentifiers.CardDropEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.CardResponseEvent:
        this.responseCard(
          content as EventPicker<
            GameEventIdentifiers.CardResponseEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.DrawCardEvent:
        this.drawCard(
          content as EventPicker<
            GameEventIdentifiers.DrawCardEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.ObtainCardEvent:
        this.obtainCard(
          content as EventPicker<
            GameEventIdentifiers.ObtainCardEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.MoveCardEvent:
        this.moveCard(
          content as EventPicker<
            GameEventIdentifiers.MoveCardEvent,
            WorkPlace.Server
          >,
        );
        break;

      case GameEventIdentifiers.SkillUseEvent:
        this.useSkill(
          content as EventPicker<
            GameEventIdentifiers.SkillUseEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.PinDianEvent:
        this.pinDian(
          content as EventPicker<
            GameEventIdentifiers.PinDianEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.DamageEvent:
        this.damage(
          content as EventPicker<
            GameEventIdentifiers.DamageEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.JudgeEvent:
        this.judge(
          content as EventPicker<
            GameEventIdentifiers.JudgeEvent,
            WorkPlace.Server
          >,
        );
        break;

      case GameEventIdentifiers.GameCreatedEvent:
        this.gameCreated(
          content as EventPicker<
            GameEventIdentifiers.GameCreatedEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.GameStartEvent:
        this.gameStart(
          content as EventPicker<
            GameEventIdentifiers.GameStartEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.GameOverEvent:
        this.gameOver(
          content as EventPicker<
            GameEventIdentifiers.GameOverEvent,
            WorkPlace.Server
          >,
        );
        break;

      case GameEventIdentifiers.PlayerEnterEvent:
        this.playerEnter(
          content as EventPicker<
            GameEventIdentifiers.PlayerEnterEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        this.playerLeave(
          content as EventPicker<
            GameEventIdentifiers.PlayerLeaveEvent,
            WorkPlace.Server
          >,
        );
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        this.playerDied(
          content as EventPicker<
            GameEventIdentifiers.PlayerDiedEvent,
            WorkPlace.Server
          >,
        );
      default:
        break;
    }
  }

  public abstract userMessage(
    ev: EventPicker<GameEventIdentifiers.UserMessageEvent, WorkPlace.Server>,
  ): void;

  public abstract gameCreated(
    ev: EventPicker<GameEventIdentifiers.GameCreatedEvent, WorkPlace.Server>,
  ): void;
  public abstract gameOver(
    ev: EventPicker<GameEventIdentifiers.GameOverEvent, WorkPlace.Server>,
  ): void;
  public abstract gameStart(
    ev: EventPicker<GameEventIdentifiers.GameStartEvent, WorkPlace.Server>,
  ): void;
  public abstract playerEnter(
    ev: EventPicker<GameEventIdentifiers.PlayerEnterEvent, WorkPlace.Server>,
  ): void;
  public abstract playerLeave(
    ev: EventPicker<GameEventIdentifiers.PlayerLeaveEvent, WorkPlace.Server>,
  ): void;
  public abstract playerDied(
    ev: EventPicker<GameEventIdentifiers.PlayerDiedEvent, WorkPlace.Server>,
  ): void;

  public abstract useCard(
    ev: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Server>,
  ): void;
  public abstract dropCard(
    ev: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Server>,
  ): void;
  public abstract responseCard(
    ev: EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace.Server>,
  ): void;
  public abstract drawCard(
    ev: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Server>,
  ): void;
  public abstract obtainCard(
    ev: EventPicker<GameEventIdentifiers.ObtainCardEvent, WorkPlace.Server>,
  ): void;
  public abstract moveCard(
    ev: EventPicker<GameEventIdentifiers.MoveCardEvent, WorkPlace.Server>,
  ): void;

  public abstract useSkill(
    ev: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Server>,
  ): void;
  public abstract pinDian(
    ev: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Server>,
  ): void;
  public abstract damage(
    ev: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Server>,
  ): void;
  public abstract judge(
    ev: EventPicker<GameEventIdentifiers.JudgeEvent, WorkPlace.Server>,
  ): void;
}
