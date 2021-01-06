import { GameRunningInfo } from 'core/game/game_props';
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
  GameEventIdentifiers.GameOverEvent,
  GameEventIdentifiers.PlayerDyingEvent,
  GameEventIdentifiers.PlayerDiedEvent,
  GameEventIdentifiers.PlayerEnterEvent,
  GameEventIdentifiers.PlayerReenterEvent,
  GameEventIdentifiers.PlayerBulkPacketEvent,
  GameEventIdentifiers.PlayerLeaveEvent,

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
  GameEventIdentifiers.AskForChoosingOptionsEvent,
  GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
  GameEventIdentifiers.AskForSkillUseEvent,
  GameEventIdentifiers.AskForChoosingCharacterEvent,
  GameEventIdentifiers.AskForPlaceCardsInDileEvent,
  GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
  GameEventIdentifiers.ObserveCardFinishEvent,
];

export const serverActiveListenerEvents = [
  GameEventIdentifiers.UserMessageEvent,
  GameEventIdentifiers.PlayerEnterEvent,
  GameEventIdentifiers.PlayerLeaveEvent,
  GameEventIdentifiers.PlayerStatusEvent,
  GameEventIdentifiers.PlayerReenterEvent,
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

const enum PrivateTagEnum {
  DamageSignatureInCardUse = 'DamageSignatureInCardUse',
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

export class EventPacker {
  private constructor() {}

  static wrapGameRunningInfo<T extends GameEventIdentifiers>(
    event: ServerEventFinder<T>,
    info: GameRunningInfo,
  ): ServerEventFinder<T> {
    return { ...event, ...info };
  }

  static getGameRunningInfo<T extends GameEventIdentifiers>(event: ServerEventFinder<T>): GameRunningInfo {
    const { numberOfDrawStack, numberOfDropStack, round, currentPlayerId } = event as any;

    return {
      numberOfDrawStack,
      numberOfDropStack,
      round,
      currentPlayerId,
    };
  }

  static minifyPayload = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => {
    const { middlewares, ...paylod } = event as any;
    return paylod;
  }

  static setTimestamp = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): void => {
    (event as any).timestamp = Date.now();
  };

  static getTimestamp = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): number | undefined => {
    return (event as any).timestamp;
  };

  static isDisresponsiveEvent = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): boolean => {
    return (event as any).disresponsive;
  };

  static setDisresponsiveEvent = <T extends GameEventIdentifiers>(
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    (event as any).disresponsive = true;
    return event;
  };

  static addMiddleware = <T extends GameEventIdentifiers>(
    middleware: {
      tag: string;
      data: any;
    },
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    (event as any).middlewares = (event as any).middlewares || {};
    (event as any).middlewares[middleware.tag] = middleware.data;
    return event;
  };
  static getMiddleware = <DataType>(
    tag: string,
    event: ServerEventFinder<GameEventIdentifiers>,
  ): DataType | undefined => {
    return (event as any).middlewares && (event as any).middlewares[tag];
  };

  static removeMiddleware = <T extends GameEventIdentifiers>(
    tag: string,
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    if ((event as any).middlewares && (event as any).middlewares[tag]) {
      delete (event as any).middlewares[tag];
    }
    return event;
  };

  static createUncancellableEvent = <T extends GameEventIdentifiers>(
    event: ServerEventFinder<T>,
  ): ServerEventFinder<T> => {
    (event as any).uncancellable = true;
    return event;
  };

  static createIdentifierEvent = <
    T extends GameEventIdentifiers,
    E extends ServerEventFinder<T> | ClientEventFinder<T>
  >(
    identifier: T,
    event: E,
  ): E => {
    (event as any).identifier = identifier;
    return event;
  };

  static hasIdentifier = <T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>): boolean => {
    return (event as any).identifier === identifier;
  };

  static getIdentifier = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>): T | undefined => {
    return (event as any).identifier;
  };

  static isUncancellabelEvent = <T extends GameEventIdentifiers>(event: ServerEventFinder<T>) => {
    return !!(event as any).uncancellable;
  };

  static terminate<T extends GameEventIdentifiers>(event: ServerEventFinder<T>): ServerEventFinder<T> {
    (event as any).terminate = true;
    return event;
  }

  static recall<T extends GameEventIdentifiers>(event: ServerEventFinder<T>): ServerEventFinder<T> {
    (event as any).terminate = false;
    return event;
  }

  static isTerminated(event: ServerEventFinder<GameEventIdentifiers>) {
    return !!(event as any).terminate;
  }
  static copyPropertiesTo<T extends GameEventIdentifiers, Y extends GameEventIdentifiers>(
    fromEvent: ServerEventFinder<T>,
    toEvent: ServerEventFinder<Y>,
  ) {
    if ((fromEvent as any).terminate !== undefined) {
      (toEvent as any).terminate = (fromEvent as any).terminate;
    }
    if ((fromEvent as any).uncancellable !== undefined) {
      (toEvent as any).uncancellable = (fromEvent as any).uncancellable;
    }
    if ((fromEvent as any).middlewares !== undefined) {
      (toEvent as any).middlewares = { ...(toEvent as any).middlewares, ...(fromEvent as any).middlewares };
    }
    if ((fromEvent as any).disresponsive !== undefined) {
      (toEvent as any).disresponsive = (fromEvent as any).disresponsive;
    }
  }

  public static setDamageSignatureInCardUse(
    content:
      | ServerEventFinder<GameEventIdentifiers.CardUseEvent>
      | ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
    sign: boolean = true,
  ): void {
    EventPacker.addMiddleware<GameEventIdentifiers.CardEffectEvent>(
      { tag: PrivateTagEnum.DamageSignatureInCardUse, data: sign },
      content,
    );
  }

  public static getDamageSignatureInCardUse(
    content:
      | ServerEventFinder<GameEventIdentifiers.CardUseEvent>
      | ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ): boolean {
    return !!EventPacker.getMiddleware<boolean>(PrivateTagEnum.DamageSignatureInCardUse, content);
  }
}
