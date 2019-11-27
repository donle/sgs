import { PlayerId } from 'core/player';
import { Socket, SocketMessage, SocketMessageTypes } from 'sgs/engine/socket';
import {
  SocketUserMessageEvent,
  CardUseEvent,
  SkillUseEvent,
  PinDianEvent,
  DamageEvent,
} from 'core/event';

export class ClientSocket extends Socket {
  private webSocketClient: WebSocket;

  constructor(socketUrl: string, protocol: 'http' | 'https' = 'http') {
    super(socketUrl, protocol);

    this.webSocketClient = new WebSocket(socketUrl, protocol);

    this.webSocketClient.onmessage = (event: MessageEvent) => {
      const { data }: { data: SocketMessage } = event;
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
        default:
          break;
      }
    };
  }

  public sendUserMessage(ev: SocketUserMessageEvent) {}
  public useCard(ev: CardUseEvent) {}
  public useSkill(ev: SkillUseEvent) {}
  public pinDian(ev: PinDianEvent) {}
  public damage(ev: DamageEvent) {}
}
