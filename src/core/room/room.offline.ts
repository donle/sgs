import { GameInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { ClientOfflineSocket } from 'core/network/socket.offline';
import { ClientPlayer } from 'core/player/player.client';
import { RoomId } from './room';
import { ClientRoom } from './room.client';
import { RoomEventStacker } from './utils/room_event_stack';

export class ClientOfflineRoom extends ClientRoom {
  constructor(roomId: RoomId, socket: ClientOfflineSocket, gameInfo: GameInfo, players: ClientPlayer[]) {
    super(roomId, socket, gameInfo, players, undefined as any, new GameCommonRules(), new RoomEventStacker());
  }

  public get Analytics(): RecordAnalytics {
    throw new Error('Unable to access offline analytics');
  }
}
