import { CardId } from 'cards/card';
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
  targetId: PlayerId;
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

export type GameEvent =
  | SocketUserMessageEvent
  | CardUseEvent
  | SkillUseEvent
  | DamageEvent
  | PinDianEvent;
