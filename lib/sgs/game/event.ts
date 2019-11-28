import { CardId } from 'core/cards/card';
import { PlayerId } from 'core/player/player';
import { ClientViewPlayer } from 'core/player/player.client';
import { GameInfo } from './game_props';

export type CardUseEvent = {
  fromId: PlayerId;
  cardId: CardId;
  toId?: PlayerId;
};

export type CardResponseEvent = {
  fromId: PlayerId;
  cardId: CardId;
};

export type CardDropEvent = {
  fromId: PlayerId;
  cardIds: CardId[];
};

export type SkillUseEvent = {
  fromId: PlayerId;
  cardIds?: CardId[];
  toIds?: PlayerId[];
};

export type DamageEvent = {
  attackerId?: PlayerId;
  cardIds?: CardId[];
  damage: number;
  targetId: PlayerId;
};

export type JudgeEvent = {
  toId: PlayerId;
  cardId: CardId;
  judgeCardId: CardId;
};

export type PinDianEvent = {
  attackerId: PlayerId;
  displayedCardIdByAttacker: CardId;
  targetId: PlayerId;
  displayedCardIdByTarget: CardId;
};

export type SocketUserMessageEvent = {
  playerId: PlayerId;
  message: string;
};

export type GameCreatedEvent = {
  gameInfo: GameInfo;
};

export type GameStartEvent = {
  currentPlayer: ClientViewPlayer;
  otherPlayers: ClientViewPlayer[];
};

export type GameOverEvent = {
  playersInfo: ClientViewPlayer[];
};

export type PlayerEnterEvent = {
  player: ClientViewPlayer;
};

export type PlayerLeaveEvent = {
  playerId: PlayerId;
};

export type PlayerDiedEvent = {
  player: ClientViewPlayer;
};

export type PlayerEvent =
  | CardDropEvent
  | CardResponseEvent
  | JudgeEvent
  | CardUseEvent
  | SkillUseEvent
  | DamageEvent
  | PinDianEvent;

export type GameEvent =
  | GameCreatedEvent
  | GameStartEvent
  | GameOverEvent
  | PlayerEnterEvent
  | PlayerLeaveEvent
  | PlayerDiedEvent
  | JudgeEvent
  | SocketUserMessageEvent
  | CardDropEvent
  | CardResponseEvent
  | CardUseEvent
  | SkillUseEvent
  | DamageEvent
  | PinDianEvent;
