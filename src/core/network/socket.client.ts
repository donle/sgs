import { EventMode } from 'core/event/event';
import { Socket } from 'core/network/socket';

export abstract class ClientSocket extends Socket<EventMode.Client> {
  constructor(socketUrl: string, protocol: 'http' | 'https' = 'http') {
    super(
      socketUrl,
      protocol,
      new WebSocket(socketUrl, protocol),
      EventMode.Client,
    );
  }
}
