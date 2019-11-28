import * as Events from 'sgs/game/event';

interface WebSocketMessageEvent<T = any> {
  data: T;
  type: string;
  target: any;
}
interface IWebSocket {
  onmessage(this: WebSocket, ev: WebSocketMessageEvent): any;
  send(
    data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView,
  ): void;
}

export abstract class Socket {
  constructor(
    protected socketUrl: string,
    protected protocol: 'http' | 'https',
    protected webSocket: IWebSocket,
  ) {
    this.webSocket.onmessage = (event: WebSocketMessageEvent<string>) => {
      const data = JSON.parse(event.data) as SocketMessage;
      switch (data.type) {
        case SocketMessageTypes.UserMessage:
          this.sendUserMessage(data.content);
          break;
        case SocketMessageTypes.CardUseEvent:
          this.useCard(data.content);
          break;
        case SocketMessageTypes.SkillUseEvent:
          this.useSkill(data.content);
          break;
        case SocketMessageTypes.PinDianEvent:
          this.pinDian(data.content);
          break;
        case SocketMessageTypes.DamageEvent:
          this.damage(data.content);
          break;
        case SocketMessageTypes.JudgeEvent:
          this.judge(data.content);
          break;
        case SocketMessageTypes.GameCreatedEvent:
          this.gameCreated(data.content);
          break;
        case SocketMessageTypes.GameStartEvent:
          this.gameStart(data.content);
          break;
        case SocketMessageTypes.GamOverEvent:
          this.gameOver(data.content);
          break;
        case SocketMessageTypes.PlayerEnterEvent:
          this.playerEnter(data.content);
          break;
        case SocketMessageTypes.PlayerLeaveEvent:
          this.playerLeave(data.content);
          break;
        case SocketMessageTypes.PlayerDiedEvent:
          this.playerDied(data.content);
        default:
          break;
      }
    };
  }

  public sendEvent(type: SocketMessageTypes, content: Events.GameEvent) {
    this.webSocket.send(JSON.stringify({ type, content }));
  }

  // tslint:disable-next-line:no-empty
  public playerDied(ev: Events.PlayerDiedEvent): void {}
  // tslint:disable-next-line:no-empty
  public sendUserMessage(ev: Events.SocketUserMessageEvent): void {}

  public abstract gameCreated(ev?: Events.GameCreatedEvent): void;
  public abstract gameOver(ev: Events.GameOverEvent): void;
  public abstract gameStart(ev?: Events.GameStartEvent): void;
  public abstract playerEnter(ev: Events.PlayerEnterEvent): void;
  public abstract playerLeave(ev?: Events.PlayerLeaveEvent): void;
  public abstract useCard(ev: Events.CardUseEvent): void;
  public abstract useSkill(ev: Events.SkillUseEvent): void;
  public abstract pinDian(ev: Events.PinDianEvent): void;
  public abstract damage(ev: Events.DamageEvent): void;
  public abstract judge(ev: Events.JudgeEvent): void;
}

export const enum SocketMessageTypes {
  UserMessage,
  CardDropEvent,
  CardResponseEvent,
  CardUseEvent,
  SkillUseEvent,
  PinDianEvent,
  DamageEvent,
  JudgeEvent,

  GameCreatedEvent,
  GameStartEvent,
  GamOverEvent,
  PlayerEnterEvent,
  PlayerLeaveEvent,
  PlayerDiedEvent,
}

export type GameEventMessage =
  | {
      type: SocketMessageTypes.UserMessage;
      content: Events.SocketUserMessageEvent;
    }
  | {
      type: SocketMessageTypes.CardUseEvent;
      content: Events.CardUseEvent;
    }
  | {
      type: SocketMessageTypes.CardDropEvent;
      content: Events.CardDropEvent;
    }
  | {
      type: SocketMessageTypes.CardResponseEvent;
      content: Events.CardResponseEvent;
    }
  | {
      type: SocketMessageTypes.SkillUseEvent;
      content: Events.SkillUseEvent;
    }
  | {
      type: SocketMessageTypes.PinDianEvent;
      content: Events.PinDianEvent;
    }
  | {
      type: SocketMessageTypes.DamageEvent;
      content: Events.DamageEvent;
    }
  | {
      type: SocketMessageTypes.JudgeEvent;
      content: Events.JudgeEvent;
    };

export type RoomEventMessage =
  | {
      type: SocketMessageTypes.GameCreatedEvent;
      content: Events.GameCreatedEvent;
    }
  | {
      type: SocketMessageTypes.GameStartEvent;
      content?: Events.GameStartEvent;
    }
  | {
      type: SocketMessageTypes.GamOverEvent;
      content: Events.GameOverEvent;
    }
  | {
      type: SocketMessageTypes.PlayerEnterEvent;
      content: Events.PlayerEnterEvent;
    }
  | {
      type: SocketMessageTypes.PlayerLeaveEvent;
      content: Events.PlayerLeaveEvent;
    }
  | {
      type: SocketMessageTypes.PlayerDiedEvent;
      content: Events.PlayerDiedEvent;
    };

export type SocketMessage = GameEventMessage | RoomEventMessage;
