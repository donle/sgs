import { Socket } from 'sgs/engine/socket';

export abstract class ClientSocket extends Socket {
  constructor(socketUrl: string, protocol: 'http' | 'https' = 'http') {
    super(socketUrl, protocol, new WebSocket(socketUrl, protocol));
  }
}
