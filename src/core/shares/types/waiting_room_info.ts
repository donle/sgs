import { WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';

export type WaitingRoomInfo = {
  roomId: RoomId;
  roomInfo: TemporaryRoomCreationInfo;
  players: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>['otherPlayersInfo'];
  closedSeats: number[];
  hostPlayerId: PlayerId;
  isPlaying: boolean;
};
