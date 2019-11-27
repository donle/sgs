import {
  CardUseEvent,
  DamageEvent,
  GameEvent,
  GameOverEvent,
  GameStartEvent,
  JudgeEvent,
  PinDianEvent,
  PlayerDiedEvent,
  SkillUseEvent,
  SocketUserMessageEvent,
} from 'core/event';

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
        case SocketMessageTypes.GameStartEvent:
          this.gameStart(data.content);
          break;
        case SocketMessageTypes.GamOverEvent:
          this.gameOver(data.content);
          break;
        case SocketMessageTypes.PlayerDiedEvent:
          this.playerDied(data.content);
        default:
          break;
      }
    };
  }

  public sendEvent(type: SocketMessageTypes, content: GameEvent) {
    this.webSocket.send(JSON.stringify({ type, content }));
  }

  // tslint:disable-next-line:no-empty
  public playerDied(ev: PlayerDiedEvent): void {}
  // tslint:disable-next-line:no-empty
  public sendUserMessage(ev: SocketUserMessageEvent): void {}

  public abstract gameStart(ev?: GameStartEvent): void;
  public abstract gameOver(ev: GameOverEvent): void;
  public abstract useCard(ev: CardUseEvent): void;
  public abstract useSkill(ev: SkillUseEvent): void;
  public abstract pinDian(ev: PinDianEvent): void;
  public abstract damage(ev: DamageEvent): void;
  public abstract judge(ev: JudgeEvent): void;
}

export const enum SocketMessageTypes {
  UserMessage,
  CardUseEvent,
  SkillUseEvent,
  PinDianEvent,
  DamageEvent,
  JudgeEvent,

  GameStartEvent,
  GamOverEvent,
  PlayerDiedEvent,
}

export type GameEventMessage =
  | {
      type: SocketMessageTypes.UserMessage;
      content: SocketUserMessageEvent;
    }
  | {
      type: SocketMessageTypes.CardUseEvent;
      content: CardUseEvent;
    }
  | {
      type: SocketMessageTypes.SkillUseEvent;
      content: SkillUseEvent;
    }
  | {
      type: SocketMessageTypes.PinDianEvent;
      content: PinDianEvent;
    }
  | {
      type: SocketMessageTypes.DamageEvent;
      content: DamageEvent;
    }
  | {
      type: SocketMessageTypes.JudgeEvent;
      content: JudgeEvent;
    };

export type RoomEventMessage =
  | {
      type: SocketMessageTypes.GameStartEvent;
      content?: GameStartEvent;
    }
  | {
      type: SocketMessageTypes.GamOverEvent;
      content: GameOverEvent;
    }
  | {
      type: SocketMessageTypes.PlayerDiedEvent;
      content: PlayerDiedEvent;
    };

export type SocketMessage = GameEventMessage | RoomEventMessage;
