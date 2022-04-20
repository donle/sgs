import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import * as mobx from 'mobx';

export type WaitingRoomGameSettings = Pick<
  TemporaryRoomCreationInfo,
  Exclude<
    keyof TemporaryRoomCreationInfo,
    'numberOfPlayers' | 'roomName' | 'campaignMode' | 'coreVersion' | 'hostPlayerId'
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
  @mobx.observable.ref
  gameSettings: WaitingRoomGameSettings;

  @mobx.observable.ref
  seats: WaitingRoomSeatInfo[];
}
