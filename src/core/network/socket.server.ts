import { EventMode } from 'core/event/event';
import { Socket } from 'core/network/socket';
import * as ServerWebSocket from 'ws';

export abstract class ServerSocket extends Socket<EventMode.Server> {
  constructor(socketUrl: string, protocol: 'http' | 'https' = 'http') {
    super(
      socketUrl,
      protocol,
      new ServerWebSocket(socketUrl, {
        protocol,
      }),
      EventMode.Server,
    );
  }
}
