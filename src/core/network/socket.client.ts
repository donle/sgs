import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { socketUrl } from 'core/game/host.config';
import { Socket, SocketMessage } from 'core/network/socket';

export abstract class ClientSocket extends Socket<WorkPlace.Client> {
  private socket = new WebSocket(socketUrl);

  constructor() {
    super(WorkPlace.Client);

    this.socket.onmessage = ev => {
      const { type, content } = JSON.parse(ev.data as string) as SocketMessage<
        GameEventIdentifiers,
        WorkPlace.Client
      >;

      this.on(type, content);
    };
  }

  public sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
  ) {
    this.socket.send(JSON.stringify({ type, content }));
  }

  protected on<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<typeof type, WorkPlace.Client>,
  ) {
    switch (type) {
      case GameEventIdentifiers.UserMessageEvent:
        this.userMessage(
          content as EventPicker<GameEventIdentifiers.UserMessageEvent, WorkPlace.Client>,
        );
        break;

      case GameEventIdentifiers.CardUseEvent:
        this.useCard(
          content as EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.CardDropEvent:
        this.dropCard(
          content as EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.CardResponseEvent:
        this.responseCard(
          content as EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.DrawCardEvent:
        this.drawCard(
          content as EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.ObtainCardEvent:
        this.obtainCard(
          content as EventPicker<GameEventIdentifiers.ObtainCardEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.MoveCardEvent:
        this.moveCard(
          content as EventPicker<GameEventIdentifiers.MoveCardEvent, WorkPlace.Client>,
        );
        break;

      case GameEventIdentifiers.SkillUseEvent:
        this.useSkill(
          content as EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.PinDianEvent:
        this.pinDian(
          content as EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.DamageEvent:
        this.damage(
          content as EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.JudgeEvent:
        this.judge(content as EventPicker<GameEventIdentifiers.JudgeEvent, WorkPlace.Client>);
        break;

      case GameEventIdentifiers.GameCreatedEvent:
        this.gameCreated(
          content as EventPicker<GameEventIdentifiers.GameCreatedEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.GameStartEvent:
        this.gameStart(
          content as EventPicker<GameEventIdentifiers.GameStartEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.GameOverEvent:
        this.gameOver(
          content as EventPicker<GameEventIdentifiers.GameOverEvent, WorkPlace.Client>,
        );
        break;

      case GameEventIdentifiers.PlayerEnterEvent:
        this.playerEnter(
          content as EventPicker<GameEventIdentifiers.PlayerEnterEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        this.playerLeave(
          content as EventPicker<GameEventIdentifiers.PlayerLeaveEvent, WorkPlace.Client>,
        );
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        this.playerDied(
          content as EventPicker<GameEventIdentifiers.PlayerDiedEvent, WorkPlace.Client>,
        );
      default:
        break;
    }
  }

  public abstract userMessage(
    ev: EventPicker<GameEventIdentifiers.UserMessageEvent, WorkPlace.Client>,
  ): void;

  public abstract gameCreated(
    ev: EventPicker<GameEventIdentifiers.GameCreatedEvent, WorkPlace.Client>,
  ): void;
  public abstract gameOver(
    ev: EventPicker<GameEventIdentifiers.GameOverEvent, WorkPlace.Client>,
  ): void;
  public abstract gameStart(
    ev: EventPicker<GameEventIdentifiers.GameStartEvent, WorkPlace.Client>,
  ): void;
  public abstract playerEnter(
    ev: EventPicker<GameEventIdentifiers.PlayerEnterEvent, WorkPlace.Client>,
  ): void;
  public abstract playerLeave(
    ev: EventPicker<GameEventIdentifiers.PlayerLeaveEvent, WorkPlace.Client>,
  ): void;
  public abstract playerDied(
    ev: EventPicker<GameEventIdentifiers.PlayerDiedEvent, WorkPlace.Client>,
  ): void;

  public abstract useCard(
    ev: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Client>,
  ): void;
  public abstract dropCard(
    ev: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Client>,
  ): void;
  public abstract responseCard(
    ev: EventPicker<GameEventIdentifiers.CardResponseEvent, WorkPlace.Client>,
  ): void;
  public abstract drawCard(
    ev: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Client>,
  ): void;
  public abstract obtainCard(
    ev: EventPicker<GameEventIdentifiers.ObtainCardEvent, WorkPlace.Client>,
  ): void;
  public abstract moveCard(
    ev: EventPicker<GameEventIdentifiers.MoveCardEvent, WorkPlace.Client>,
  ): void;

  public abstract useSkill(
    ev: EventPicker<GameEventIdentifiers.SkillUseEvent, WorkPlace.Client>,
  ): void;
  public abstract pinDian(
    ev: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Client>,
  ): void;
  public abstract damage(
    ev: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Client>,
  ): void;
  public abstract judge(
    ev: EventPicker<GameEventIdentifiers.JudgeEvent, WorkPlace.Client>,
  ): void;
}
