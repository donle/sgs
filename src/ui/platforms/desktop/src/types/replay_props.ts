import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { GameInfo } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';

export type ReplayPlayerInfo = {
  Id: PlayerId;
  Name: string;
  Position: number;
};

export type ReplayDataType = {
  gameInfo: GameInfo;
  playersInfo: ReplayPlayerInfo[];
  roomId: RoomId;
  viewerId: PlayerId;
  viewerName: string;
  version: string;
  events: ServerEventFinder<GameEventIdentifiers>[];
};
