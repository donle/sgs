import { ClientEvent } from './event.client';
import { ServerEvent } from './event.server';

export const enum GameEventIdentifiers {
  UserMessageEvent,

  CardDropEvent,
  CardResponseEvent,
  CardUseEvent,
  DrawCardEvent,
  ObtainCardEvent,
  MoveCardEvent,

  SkillUseEvent,
  PinDianEvent,
  DamageEvent,
  RecoverEvent,
  JudgeEvent,

  GameCreatedEvent,
  GameStartEvent,
  GameOverEvent,
  PlayerEnterEvent,
  PlayerLeaveEvent,
  PlayerDiedEvent,

  AskForPeachEvent,
  AskForNullificationEvent,
  AskForCardResponseEvent,
  AskForCardUseEvent,
  AskForCardDisplayEvent,
  AskForCardDropEvent,
}

export const enum WorkPlace {
  Client,
  Server,
}

export type BaseGameEvent = {
  triggeredBySkillName?: string;
  message?: string;
}

export type EventUtilities = {
  [K in keyof typeof GameEventIdentifiers]: object;
};

export type EventPicker<
  I extends GameEventIdentifiers,
  E extends WorkPlace
> = BaseGameEvent & (E extends WorkPlace.Client ? ClientEvent[I] : ServerEvent[I]);

export type ClientEventFinder<I extends GameEventIdentifiers> = BaseGameEvent & ClientEvent[I];
export type ServerEventFinder<I extends GameEventIdentifiers> = BaseGameEvent & ServerEvent[I];
