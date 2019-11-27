import { Socket } from 'sgs/engine/socket';

export class ClientSocket extends Socket {
  private webSocketClient: WebSocket;

  constructor(socketUrl: string, protocol: 'http' | 'https' = 'http') {
    super(socketUrl, protocol);

    this.webSocketClient = new WebSocket(socketUrl, protocol);
  }
}
