import { EventMode, EventPicker, GameEventIdentifiers } from 'core/event/event';
import { socketUrl } from 'core/game/host.config';
import { Socket, SocketMessage } from 'core/network/socket';

export abstract class ClientSocket extends Socket<EventMode.Client> {
  private socket = new WebSocket(socketUrl);

  constructor() {
    super(EventMode.Client);

    this.socket.onmessage = ev => {
      const { type, content } = JSON.parse(ev.data as string) as SocketMessage<
        GameEventIdentifiers,
        EventMode.Client
      >;

      this.on(type, content);
    };
  }

  public sendEvent(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, EventMode.Client>,
  ) {
    this.socket.send(JSON.stringify({ type, content }));
  }

  protected on<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<typeof type, EventMode.Client>,
  ) {
    switch (type) {
      case GameEventIdentifiers.UserMessageEvent:
        this.userMessage(
          content as EventPicker<GameEventIdentifiers.UserMessageEvent, EventMode.Client>,
        );
        break;

      case GameEventIdentifiers.CardUseEvent:
        this.useCard(
          content as EventPicker<GameEventIdentifiers.CardUseEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.CardDropEvent:
        this.dropCard(
          content as EventPicker<GameEventIdentifiers.CardDropEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.CardResponseEvent:
        this.responseCard(
          content as EventPicker<GameEventIdentifiers.CardResponseEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.DrawCardEvent:
        this.drawCard(
          content as EventPicker<GameEventIdentifiers.DrawCardEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.ObtainCardEvent:
        this.obtainCard(
          content as EventPicker<GameEventIdentifiers.ObtainCardEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.MoveCardEvent:
        this.moveCard(
          content as EventPicker<GameEventIdentifiers.MoveCardEvent, EventMode.Client>,
        );
        break;

      case GameEventIdentifiers.SkillUseEvent:
        this.useSkill(
          content as EventPicker<GameEventIdentifiers.SkillUseEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.PinDianEvent:
        this.pinDian(
          content as EventPicker<GameEventIdentifiers.PinDianEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.DamageEvent:
        this.damage(
          content as EventPicker<GameEventIdentifiers.DamageEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.JudgeEvent:
        this.judge(content as EventPicker<GameEventIdentifiers.JudgeEvent, EventMode.Client>);
        break;

      case GameEventIdentifiers.GameCreatedEvent:
        this.gameCreated(
          content as EventPicker<GameEventIdentifiers.GameCreatedEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.GameStartEvent:
        this.gameStart(
          content as EventPicker<GameEventIdentifiers.GameStartEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.GameOverEvent:
        this.gameOver(
          content as EventPicker<GameEventIdentifiers.GameOverEvent, EventMode.Client>,
        );
        break;

      case GameEventIdentifiers.PlayerEnterEvent:
        this.playerEnter(
          content as EventPicker<GameEventIdentifiers.PlayerEnterEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        this.playerLeave(
          content as EventPicker<GameEventIdentifiers.PlayerLeaveEvent, EventMode.Client>,
        );
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        this.playerDied(
          content as EventPicker<GameEventIdentifiers.PlayerDiedEvent, EventMode.Client>,
        );
      default:
        break;
    }
  }

  public abstract userMessage(
    ev: EventPicker<GameEventIdentifiers.UserMessageEvent, EventMode.Client>,
  ): void;

  public abstract gameCreated(
    ev: EventPicker<GameEventIdentifiers.GameCreatedEvent, EventMode.Client>,
  ): void;
  public abstract gameOver(
    ev: EventPicker<GameEventIdentifiers.GameOverEvent, EventMode.Client>,
  ): void;
  public abstract gameStart(
    ev: EventPicker<GameEventIdentifiers.GameStartEvent, EventMode.Client>,
  ): void;
  public abstract playerEnter(
    ev: EventPicker<GameEventIdentifiers.PlayerEnterEvent, EventMode.Client>,
  ): void;
  public abstract playerLeave(
    ev: EventPicker<GameEventIdentifiers.PlayerLeaveEvent, EventMode.Client>,
  ): void;
  public abstract playerDied(
    ev: EventPicker<GameEventIdentifiers.PlayerDiedEvent, EventMode.Client>,
  ): void;

  public abstract useCard(
    ev: EventPicker<GameEventIdentifiers.CardUseEvent, EventMode.Client>,
  ): void;
  public abstract dropCard(
    ev: EventPicker<GameEventIdentifiers.CardDropEvent, EventMode.Client>,
  ): void;
  public abstract responseCard(
    ev: EventPicker<GameEventIdentifiers.CardResponseEvent, EventMode.Client>,
  ): void;
  public abstract drawCard(
    ev: EventPicker<GameEventIdentifiers.DrawCardEvent, EventMode.Client>,
  ): void;
  public abstract obtainCard(
    ev: EventPicker<GameEventIdentifiers.ObtainCardEvent, EventMode.Client>,
  ): void;
  public abstract moveCard(
    ev: EventPicker<GameEventIdentifiers.MoveCardEvent, EventMode.Client>,
  ): void;

  public abstract useSkill(
    ev: EventPicker<GameEventIdentifiers.SkillUseEvent, EventMode.Client>,
  ): void;
  public abstract pinDian(
    ev: EventPicker<GameEventIdentifiers.PinDianEvent, EventMode.Client>,
  ): void;
  public abstract damage(
    ev: EventPicker<GameEventIdentifiers.DamageEvent, EventMode.Client>,
  ): void;
  public abstract judge(
    ev: EventPicker<GameEventIdentifiers.JudgeEvent, EventMode.Client>,
  ): void;
}
