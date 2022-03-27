import { WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { Logger } from 'core/shares/libs/logger/logger';
import { ServerConfig } from 'server/server_config';

export type WaitingRoomInfo = {
  roomInfo: TemporaryRoomCreationInfo;
  players: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>['otherPlayersInfo'];
  closedSeats: number[];
};

export class WaitingRoomChannel {
  private socketResolver: Promise<SocketIO.Socket>;
  private waitingRooms: WaitingRoomInfo[] = [];

  constructor(private socket: SocketIO.Server, private logger: Logger, private config: ServerConfig) {
    this.socketResolver = new Promise(r => this.socket.of('/waiting-room').on('connect', socket => r(socket)));
  }
}
