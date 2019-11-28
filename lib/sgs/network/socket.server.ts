import { Socket } from 'sgs/network/socket';
import * as ServerWebSocket from 'ws';

export abstract class ServerSocket extends Socket {
  constructor(socketUrl: string, protocol: 'http' | 'https' = 'http') {
    super(
      socketUrl,
      protocol,
      new ServerWebSocket(socketUrl, {
        protocol,
      }),
    );
  }
}
