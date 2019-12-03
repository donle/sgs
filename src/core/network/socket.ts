import {
  AllGameEvent,
  EventMode,
  EventPicker,
  GameEventIdentifiers,
} from 'core/event/event';

interface WebSocketMessageEvent {
  data: string;
  type: string;
  target: any;
}
interface IWebSocket {
  onmessage(this: WebSocket, ev: WebSocketMessageEvent): any;
  send(
    data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView,
  ): void;
}

export abstract class Socket<T extends EventMode> {
  constructor(
    protected socketUrl: string,
    protected protocol: 'http' | 'https',
    protected webSocket: IWebSocket,
    protected eventMode: T,
  ) {
    this.webSocket.onmessage = (event: WebSocketMessageEvent) => {
      const { type, content } = JSON.parse(event.data) as SocketMessage<
        GameEventIdentifiers,
        T
      >;

      switch (type) {
        case GameEventIdentifiers.UserMessageEvent:
          this.sendUserMessage(content as EventPicker<typeof type, T>);
          break;

        case GameEventIdentifiers.CardUseEvent:
          this.useCard(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.CardDropEvent:
          this.dropCard(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.CardResponseEvent:
          this.responseCard(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.DrawCardEvent:
          this.drawCard(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.ObtainCardEvent:
          this.obtainCard(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.MoveCardEvent:
          this.moveCard(content as EventPicker<typeof type, T>);
          break;

        case GameEventIdentifiers.SkillUseEvent:
          this.useSkill(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.PinDianEvent:
          this.pinDian(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.DamageEvent:
          this.damage(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.JudgeEvent:
          this.judge(content as EventPicker<typeof type, T>);
          break;

        case GameEventIdentifiers.GameCreatedEvent:
          this.gameCreated(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.GameStartEvent:
          this.gameStart(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.GameOverEvent:
          this.gameOver(content as EventPicker<typeof type, T>);
          break;

        case GameEventIdentifiers.PlayerEnterEvent:
          this.playerEnter(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.PlayerLeaveEvent:
          this.playerLeave(content as EventPicker<typeof type, T>);
          break;
        case GameEventIdentifiers.PlayerDiedEvent:
          this.playerDied(content as EventPicker<typeof type, T>);
        default:
          break;
      }
    };
  }

  public sendEvent(type: GameEventIdentifiers, content: AllGameEvent) {
    this.webSocket.send(JSON.stringify({ type, content }));
  }

  public abstract sendUserMessage(
    ev: EventPicker<GameEventIdentifiers.UserMessageEvent, T>,
  ): void;

  public abstract gameCreated(
    ev: EventPicker<GameEventIdentifiers.GameCreatedEvent, T>,
  ): void;
  public abstract gameOver(
    ev: EventPicker<GameEventIdentifiers.GameOverEvent, T>,
  ): void;
  public abstract gameStart(
    ev: EventPicker<GameEventIdentifiers.GameStartEvent, T>,
  ): void;
  public abstract playerEnter(
    ev: EventPicker<GameEventIdentifiers.PlayerEnterEvent, T>,
  ): void;
  public abstract playerLeave(
    ev: EventPicker<GameEventIdentifiers.PlayerLeaveEvent, T>,
  ): void;
  public abstract playerDied(
    ev: EventPicker<GameEventIdentifiers.PlayerDiedEvent, T>,
  ): void;

  public abstract useCard(
    ev: EventPicker<GameEventIdentifiers.CardUseEvent, T>,
  ): void;
  public abstract dropCard(
    ev: EventPicker<GameEventIdentifiers.CardDropEvent, T>,
  ): void;
  public abstract responseCard(
    ev: EventPicker<GameEventIdentifiers.CardResponseEvent, T>,
  ): void;
  public abstract drawCard(
    ev: EventPicker<GameEventIdentifiers.DrawCardEvent, T>,
  ): void;
  public abstract obtainCard(
    ev: EventPicker<GameEventIdentifiers.ObtainCardEvent, T>,
  ): void;
  public abstract moveCard(
    ev: EventPicker<GameEventIdentifiers.MoveCardEvent, T>,
  ): void;

  public abstract useSkill(
    ev: EventPicker<GameEventIdentifiers.SkillUseEvent, T>,
  ): void;
  public abstract pinDian(
    ev: EventPicker<GameEventIdentifiers.PinDianEvent, T>,
  ): void;
  public abstract damage(
    ev: EventPicker<GameEventIdentifiers.DamageEvent, T>,
  ): void;
  public abstract judge(
    ev: EventPicker<GameEventIdentifiers.JudgeEvent, T>,
  ): void;
}

export type SocketMessage<
  I extends GameEventIdentifiers = GameEventIdentifiers,
  E extends EventMode = EventMode
> = {
  type: I;
  content: EventPicker<I, E>;
};
