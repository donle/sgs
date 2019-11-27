import { Socket } from 'sgs/engine/socket';
import * as ws from 'ws';

export class ServerSocket extends Socket {
  private serverSocket = new ws(this.socketUrl, {
    protocol: this.protocol,
  });
}
