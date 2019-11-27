import { Socket } from 'sgs/engine/socket';
import * as ServerWebSocket from 'ws';

export abstract class ServerSocket extends Socket {
  constructor(socketUrl: string, protocol: 'http' | 'https' = 'http') {
    super(socketUrl, protocol, new ServerWebSocket(socketUrl, {
      protocol,
    }));
  }
}
