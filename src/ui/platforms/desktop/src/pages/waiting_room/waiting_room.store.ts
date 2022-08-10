import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import * as mobx from 'mobx';
import { ChatPacketObject } from 'services/connection_service/connection_service';

export type WaitingRoomGameSettings = Pick<
  TemporaryRoomCreationInfo,
  Exclude<
    keyof TemporaryRoomCreationInfo,
    'roomName' | 'campaignMode' | 'coreVersion' | 'hostPlayerId'
  >
>;

export type WaitingRoomSeatInfo = { seatId: number } & (
  | {
      playerName?: string;
      playerId?: string;
      playerAvatarId?: number;
      playerReady?: boolean;
      seatDisabled: false;
    }
  | { seatDisabled: true }
);

export class WaitingRoomStore {
  constructor(public readonly selfPlayerId: PlayerId) {}

  @mobx.observable.deep
  gameSettings: WaitingRoomGameSettings;

  @mobx.observable.deep
  seats: WaitingRoomSeatInfo[] = [];

  @mobx.observable.deep
  chatMessages: ChatPacketObject[] = [];
}
