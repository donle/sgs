import { CardId } from 'cards/card';
import { ClientViewPlayer } from 'sgs/client/player';
import { PlayerId } from './player';

export type CardUseEvent = {
  fromId: PlayerId;
  cardId: CardId;
  toId?: PlayerId;
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

export type GameStartEvent = {
  currentPlayer: ClientViewPlayer;
  otherPlayers: ClientViewPlayer[];
};

export type GameOverEvent = {
  playersInfo: ClientViewPlayer[];
};

export type PlayerDiedEvent = {
  player: ClientViewPlayer;
};

export type GameEvent =
  | GameStartEvent
  | GameOverEvent
  | PlayerDiedEvent
  | JudgeEvent
  | SocketUserMessageEvent
  | CardUseEvent
  | SkillUseEvent
  | DamageEvent
  | PinDianEvent;
