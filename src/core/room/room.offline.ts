import { GameInfo } from 'core/game/game_props';
import { RecordAnalytics } from 'core/game/record_analytics';
import { ClientOfflineSocket } from 'core/network/socket.offline';
import { ClientPlayer } from 'core/player/player.client';
import { RoomId } from './room';
import { ClientRoom } from './room.client';

export class ClientOfflineRoom extends ClientRoom {
  constructor(roomId: RoomId, socket: ClientOfflineSocket, gameInfo: GameInfo, players: ClientPlayer[]) {
    super(roomId, socket, gameInfo, players, undefined as any);
  }

  public get Analytics(): RecordAnalytics {
    throw new Error('Unable to access offline analytics');
  }
}
