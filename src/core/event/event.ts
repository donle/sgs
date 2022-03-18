import { PlayerId } from 'core/player/player_props';
import { PatchedTranslationObject } from 'core/translations/translation_json_tool';
import { ClientEvent } from './event.client';
import { ServerEvent } from './event.server';

export const enum GameEventIdentifiers {
  UserMessageEvent = 100,
  PlayerStatusEvent,
  NotifyEvent,
  CustomGameDialog,
  PhaseChangeEvent,
  PhaseStageChangeEvent,
  SyncGameCommonRulesEvent,
  PlayerPropertiesChangeEvent,
  SetOutsideCharactersEvent,
  HuaShenCardUpdatedEvent,
  UpgradeSideEffectSkillsEvent,

  SetFlagEvent,
  RemoveFlagEvent,
  ClearFlagEvent,
  AddMarkEvent,
  SetMarkEvent,
  RemoveMarkEvent,
  ClearMarkEvent,

  DrunkEvent,
  ChainLockedEvent,

  LoseSkillEvent,
  ObtainSkillEvent,

  ReforgeEvent,
  CardResponseEvent,
  CardUseEvent,
  CardEffectEvent,
  CardDisplayEvent,
  DrawCardEvent,
  MoveCardEvent,
  ObserveCardsEvent,
  ObserveCardFinishEvent,

  AimEvent,

  SkillUseEvent,
  SkillEffectEvent,
  PinDianEvent,
  LoseHpEvent,
  ChangeMaxHpEvent,
  DamageEvent,
  RecoverEvent,
  HpChangeEvent,
  JudgeEvent,

  GameReadyEvent,
  GameStartEvent,
  GameBeginEvent,
  CircleStartEvent,
  LevelBeginEvent,
  GameOverEvent,
  PlayerEnterRefusedEvent,
  PlayerReenterEvent,
  PlayerBulkPacketEvent,
  PlayerEnterEvent,
  PlayerLeaveEvent,
  PlayerDyingEvent,
  PlayerDiedEvent,

  PhaseSkippedEvent,
  PlayerChainedEvent,
  PlayerTurnOverEvent,

  AskForPlayCardsOrSkillsEvent,
  AskForPeachEvent,
  AskForCardResponseEvent,
  AskForCardUseEvent,
  AskForCardDisplayEvent,
  AskForCardDropEvent,
  AskForCardEvent,
  AskForPinDianCardEvent,
  AskForChoosingCardEvent,
  AskForChoosingCardWithConditionsEvent,
  AskForChoosingPlayerEvent,
  AskForChoosingOptionsEvent,
  AskForChoosingCharacterEvent,
  AskForChoosingCardFromPlayerEvent,
  AskForSkillUseEvent,
  AskForPlaceCardsInDileEvent,
  AskForContinuouslyChoosingCardEvent,
  AskForChoosingCardAvailableTargetEvent,

  AbortOrResumePlayerSectionsEvent,
  AbortOrResumePlayerJudgeAreaEvent,
  RefreshOnceSkillEvent,

  HookUpSkillsEvent,
  UnhookSkillsEvent,

  RequestObserveEvent,
}

export type CardResponsiveEventIdentifiers =
  | GameEventIdentifiers.AskForPeachEvent
  | GameEventIdentifiers.AskForCardResponseEvent
  | GameEventIdentifiers.AskForCardUseEvent;

export const isCardResponsiveIdentifier = (
  identifier: GameEventIdentifiers,
): identifier is CardResponsiveEventIdentifiers => {
  return [
    GameEventIdentifiers.AskForPeachEvent,
    GameEventIdentifiers.AskForCardResponseEvent,
    GameEventIdentifiers.AskForCardUseEvent,
  ].includes(identifier);
};

export const clientActiveListenerEvents = () => [
  GameEventIdentifiers.SetFlagEvent,
  GameEventIdentifiers.RemoveFlagEvent,
  GameEventIdentifiers.ClearFlagEvent,
  GameEventIdentifiers.AddMarkEvent,
  GameEventIdentifiers.SetMarkEvent,
  GameEventIdentifiers.RemoveMarkEvent,
  GameEventIdentifiers.ClearMarkEvent,
  GameEventIdentifiers.SetOutsideCharactersEvent,
  GameEventIdentifiers.HuaShenCardUpdatedEvent,
  GameEventIdentifiers.UpgradeSideEffectSkillsEvent,

  GameEventIdentifiers.UserMessageEvent,
  GameEventIdentifiers.PhaseChangeEvent,
  GameEventIdentifiers.PhaseStageChangeEvent,
  GameEventIdentifiers.SyncGameCommonRulesEvent,
  GameEventIdentifiers.CustomGameDialog,
  GameEventIdentifiers.NotifyEvent,
  GameEventIdentifiers.PlayerStatusEvent,
  GameEventIdentifiers.PlayerPropertiesChangeEvent,

  GameEventIdentifiers.DrunkEvent,
  GameEventIdentifiers.ChainLockedEvent,

  GameEventIdentifiers.CardResponseEvent,
  GameEventIdentifiers.CardUseEvent,
  GameEventIdentifiers.CardEffectEvent,
  GameEventIdentifiers.CardDisplayEvent,
  GameEventIdentifiers.DrawCardEvent,
  GameEventIdentifiers.MoveCardEvent,
  GameEventIdentifiers.ObserveCardsEvent,

  GameEventIdentifiers.LoseSkillEvent,
  GameEventIdentifiers.ObtainSkillEvent,

  GameEventIdentifiers.AimEvent,

  GameEventIdentifiers.SkillUseEvent,
  GameEventIdentifiers.SkillEffectEvent,
  GameEventIdentifiers.PinDianEvent,
  GameEventIdentifiers.LoseHpEvent,
  GameEventIdentifiers.ChangeMaxHpEvent,
  GameEventIdentifiers.DamageEvent,
  GameEventIdentifiers.RecoverEvent,
  GameEventIdentifiers.JudgeEvent,

  GameEventIdentifiers.GameStartEvent,
  GameEventIdentifiers.GameReadyEvent,
  GameEventIdentifiers.GameBeginEvent,
  GameEventIdentifiers.CircleStartEvent,
  GameEventIdentifiers.GameOverEvent,
  GameEventIdentifiers.PlayerDyingEvent,
  GameEventIdentifiers.PlayerDiedEvent,
  GameEventIdentifiers.PlayerEnterEvent,
  GameEventIdentifiers.PlayerReenterEvent,
  GameEventIdentifiers.PlayerBulkPacketEvent,
  GameEventIdentifiers.PlayerLeaveEvent,
  GameEventIdentifiers.RequestObserveEvent,

  GameEventIdentifiers.PlayerChainedEvent,
  GameEventIdentifiers.PlayerTurnOverEvent,

  GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
  GameEventIdentifiers.AskForPeachEvent,
  GameEventIdentifiers.AskForCardResponseEvent,
  GameEventIdentifiers.AskForCardUseEvent,
  GameEventIdentifiers.AskForCardDisplayEvent,
  GameEventIdentifiers.AskForCardDropEvent,
  GameEventIdentifiers.AskForCardEvent,
  GameEventIdentifiers.AskForPinDianCardEvent,
  GameEventIdentifiers.AskForChoosingCardEvent,
  GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
  GameEventIdentifiers.AskForChoosingPlayerEvent,
  GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
  GameEventIdentifiers.AskForChoosingOptionsEvent,
  GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
  GameEventIdentifiers.AskForSkillUseEvent,
  GameEventIdentifiers.AskForChoosingCharacterEvent,
  GameEventIdentifiers.AskForPlaceCardsInDileEvent,
  GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
  GameEventIdentifiers.ObserveCardFinishEvent,

  GameEventIdentifiers.AbortOrResumePlayerSectionsEvent,
  GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent,
  GameEventIdentifiers.RefreshOnceSkillEvent,
];

export const serverActiveListenerEvents = [
  GameEventIdentifiers.UserMessageEvent,
  GameEventIdentifiers.PlayerEnterEvent,
  GameEventIdentifiers.PlayerLeaveEvent,
  GameEventIdentifiers.PlayerStatusEvent,
  GameEventIdentifiers.PlayerReenterEvent,
  GameEventIdentifiers.RequestObserveEvent,
];

export const serverResponsiveListenerEvents = [
  GameEventIdentifiers.AskForPlayCardsOrSkillsEvent,
  GameEventIdentifiers.AskForPeachEvent,
  GameEventIdentifiers.AskForCardResponseEvent,
  GameEventIdentifiers.AskForCardUseEvent,
  GameEventIdentifiers.AskForCardDisplayEvent,
  GameEventIdentifiers.AskForCardDropEvent,
  GameEventIdentifiers.AskForCardEvent,
  GameEventIdentifiers.AskForPinDianCardEvent,
  GameEventIdentifiers.AskForChoosingCardEvent,
  GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
  GameEventIdentifiers.AskForChoosingPlayerEvent,
  GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
  GameEventIdentifiers.AskForChoosingOptionsEvent,
  GameEventIdentifiers.AskForChoosingCharacterEvent,
  GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
  GameEventIdentifiers.AskForSkillUseEvent,
  GameEventIdentifiers.AskForPlaceCardsInDileEvent,
  GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
];

export const enum CardMovedBySpecifiedReason {
  JudgeProcess = 'JudgeProcess',
}

export const enum CardDrawReason {
  GameStage,
  KillReward,
  Reforge,
}

export const enum CardMoveReason {
  CardDraw,
  ActivePrey,
  ActiveMove,
  PassiveMove,
  SelfDrop,
  PassiveDrop,
  PlaceToDropStack,
  PlaceToDrawStack,
  CardUse,
  CardResponse,
  Reforge,
}

export const enum CardMoveArea {
  HandArea,
  EquipArea,
  JudgeArea,
  OutsideArea,
  DropStack,
  DrawStack,
  ProcessingArea,
}

export const enum WorkPlace {
  Client,
  Server,
}

export type BaseGameEvent = {
  unengagedMessage?: PatchedTranslationObject;
  engagedPlayerIds?: PlayerId[];
  triggeredBySkills?: string[];
  messages?: string[];
  translationsMessage?: PatchedTranslationObject;
  ignoreNotifiedStatus?: boolean;
  animation?: {
    from: PlayerId;
    tos: PlayerId[];
  }[];
};

export type ClientBaseEvent = {
  status?: 'online' | 'offline' | 'quit' | 'trusted' | 'player';
};

export type EventProcessSteps = { from: PlayerId; tos: PlayerId[] }[];

export type EventUtilities = {
  [K in keyof typeof GameEventIdentifiers]: object;
};

export type EventPicker<I extends GameEventIdentifiers, E extends WorkPlace> = BaseGameEvent &
  (E extends WorkPlace.Client ? ClientEvent[I] : ServerEvent[I]);

export type ClientEventFinder<I extends GameEventIdentifiers> = BaseGameEvent & ClientBaseEvent & ClientEvent[I];
export type ServerEventFinder<I extends GameEventIdentifiers> = BaseGameEvent & ServerEvent[I];

export const enum WaitingRoomEvent {
  SeatDisabled = 'SeatDisabled',
  SeatEnabled = 'SeatEnabled',
  GameInfoUpdate = 'GameInfoUpdate',
  PlayerEnter = 'PlayerEnter',
  PlayerLeave = 'PlayerLeave',
  PlayerReady = 'PlayerReady',
  PlayerUnready = 'PlayerUnready',
  GameStart = 'GameStart',
}

export const waitingRoomEventsList = [
  WaitingRoomEvent.SeatDisabled,
  WaitingRoomEvent.SeatEnabled,
  WaitingRoomEvent.GameInfoUpdate,
  WaitingRoomEvent.PlayerEnter,
  WaitingRoomEvent.PlayerLeave,
  WaitingRoomEvent.PlayerReady,
  WaitingRoomEvent.PlayerUnready,
  WaitingRoomEvent.GameStart,
];

export type WaitingRoomEventUtilities<Event extends object = object> = Record<WaitingRoomEvent, Event>;
