import { GameInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { ClientOfflineSocket } from 'core/network/socket.offline';
import { ClientPlayer, HegemonyClientPlayer } from 'core/player/player.client';
import { RoomId } from './room';
import { ClientRoom } from './room.client';
import { RoomEventStacker } from './utils/room_event_stack';

export class ClientOfflineRoom<P extends ClientPlayer | HegemonyClientPlayer = ClientPlayer> extends ClientRoom<P> {
  constructor(roomId: RoomId, socket: ClientOfflineSocket, gameInfo: GameInfo, players: P[]) {
    super(roomId, socket, gameInfo, players, undefined as any, new GameCommonRules(), new RoomEventStacker());
  }

  public get Analytics(): RecordAnalytics {
    throw new Error('Unable to access offline analytics');
  }
}
