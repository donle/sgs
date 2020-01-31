import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientEvent } from './event.client';
import { ServerEvent } from './event.server';

export const enum GameEventIdentifiers {
  UserMessageEvent,

  CardDropEvent,
  CardResponseEvent,
  CardUseEvent,
  CardEffectEvent,
  CardDisplayEvent,
  DrawCardEvent,
  ObtainCardEvent,
  MoveCardEvent,

  AimEvent,

  SkillUseEvent,
  PinDianEvent,
  LoseHpEvent,
  DamageEvent,
  RecoverEvent,
  JudgeEvent,

  GameStartEvent,
  GameOverEvent,
  PlayerEnterEvent,
  PlayerLeaveEvent,
  PlayerDyingEvent,
  PlayerDiedEvent,

  AskForPeachEvent,
  AskForWuXieKeJiEvent,
  AskForCardResponseEvent,
  AskForCardUseEvent,
  AskForCardDisplayEvent,
  AskForCardDropEvent,
  AskForPinDianCardEvent,
  AskForChoosingCardEvent,
  AskForChooseOptionsEvent,
  AskForChoosingCardFromPlayerEvent,
  AskForInvokeEvent,
  AskForChooseCharacterEvent,
  AskForPlaceCardsInDileEvent,
}

export const createGameEventIdentifiersStringList = () => {
  const list: string[] = [];
  for (let i = 0; i <= GameEventIdentifiers.AskForPlaceCardsInDileEvent; i++) {
    list.push(i.toString());
  }

  return list;
};

export const enum WorkPlace {
  Client,
  Server,
}

export type BaseGameEvent = {
  triggeredBySkillName?: string;
  messages?: string[];
  translationsMessage?: TranslationPack;
};

export type EventUtilities = {
  [K in keyof typeof GameEventIdentifiers]: object;
};

export type EventPicker<
  I extends GameEventIdentifiers,
  E extends WorkPlace
> = BaseGameEvent &
  (E extends WorkPlace.Client ? ClientEvent[I] : ServerEvent[I]);

export type ClientEventFinder<I extends GameEventIdentifiers> = BaseGameEvent &
  ClientEvent[I];
export type ServerEventFinder<I extends GameEventIdentifiers> = BaseGameEvent &
  ServerEvent[I];
