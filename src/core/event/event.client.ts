import { CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import { DamageType, GameInfo, TemporaryRoomCreationInfo, WaitingRoomGameSettings } from 'core/game/game_props';
import { PlayerCardsArea, PlayerId, PlayerInfo } from 'core/player/player_props';
import {
  EventUtilities,
  GameEventIdentifiers,
  ServerEventFinder,
  WaitingRoomEvent,
  WaitingRoomEventUtilities,
} from './event';

export interface ClientEvent extends EventUtilities {
  [GameEventIdentifiers.CardUseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
    toCardIds?: CardId[];
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
  };
  [GameEventIdentifiers.CardEffectEvent]: {
    fromId?: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
    toCardIds?: CardId[];
  };
  [GameEventIdentifiers.CardResponseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
  };
  [GameEventIdentifiers.DrawCardEvent]: {
    playerId: PlayerId;
    numberOfCards: number;
  };
  [GameEventIdentifiers.MoveCardEvent]: {};

  [GameEventIdentifiers.SkillUseEvent]: {
    fromId: PlayerId;
    skillName: string;
    cardIds?: CardId[];
    toIds?: PlayerId[];
  };
  [GameEventIdentifiers.ReforgeEvent]: {
    fromId: PlayerId;
    cardId: CardId;
  };
  [GameEventIdentifiers.LoseHpEvent]: {
    lostHp: number;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.DamageEvent]: {
    fromId?: PlayerId;
    cardIds?: CardId[];
    damage: number;
    damageType: DamageType;
    toId: PlayerId;
  };
  [GameEventIdentifiers.JudgeEvent]: {
    toId: PlayerId;
    cardId: CardId;
    judgeCardId: CardId;
  };
  [GameEventIdentifiers.RecoverEvent]: {
    recoverBy?: PlayerId;
    cardIds?: CardId[];
    recoveredHp: number;
    toId: PlayerId;
  };
  [GameEventIdentifiers.PinDianEvent]: {
    from: PlayerId;
    toIds: PlayerId[];
  };

  [GameEventIdentifiers.UserMessageEvent]: {
    playerId: PlayerId;
    message: string;
  };

  [GameEventIdentifiers.GameStartEvent]: {
    currentPlayer: PlayerInfo;
    otherPlayers: PlayerInfo[];
  };

  [GameEventIdentifiers.GameBeginEvent]: {};

  [GameEventIdentifiers.CircleStartEvent]: {};

  [GameEventIdentifiers.GameOverEvent]: {
    playersInfo: PlayerInfo[];
  };

  [GameEventIdentifiers.ObserverRequestChangeEvent]: {
    observerId: PlayerId;
    toObserverId: PlayerId;
  };
  [GameEventIdentifiers.PlayerEnterEvent]: {
    playerName: string;
    timestamp: number;
    playerId: string;
    coreVersion: string;
    joinAsObserver: boolean;
  };
  [GameEventIdentifiers.PlayerReenterEvent]: {
    playerName: string;
    timestamp: number;
    playerId: string;
  };
  [GameEventIdentifiers.PlayerLeaveEvent]: {
    playerId: PlayerId;
  };
  [GameEventIdentifiers.PlayerReadyEvent]: {
    playerId: PlayerId;
  };
  [GameEventIdentifiers.PlayerDiedEvent]: {
    playerInfo: PlayerInfo;
  };
  [GameEventIdentifiers.AskForPinDianCardEvent]: {
    pindianCard: CardId;
    fromId: PlayerId;
  };

  [GameEventIdentifiers.AskForPeachEvent]: {
    cardId?: CardId;
    fromId: PlayerId;
    extraUse?: boolean;
  };
  [GameEventIdentifiers.AskForCardResponseEvent]: {
    cardId?: CardId;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {
    fromId: PlayerId;
    selectedCards?: CardId[];
    selectedCardsIndex?: number[];
  };
  [GameEventIdentifiers.AskForChoosingCardWithConditionsEvent]: {
    fromId: PlayerId;
    selectedCards?: CardId[];
    selectedCardsIndex?: number[];
  };
  [GameEventIdentifiers.AskForChoosingCardFromPlayerEvent]: {
    fromId: PlayerId;
    fromArea?: PlayerCardsArea;
    selectedCard?: CardId;
    selectedCardIndex?: number;
  };
  [GameEventIdentifiers.AskForCardUseEvent]: {
    cardId?: CardId;
    toIds?: PlayerId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingOptionsEvent]: {
    selectedOption?: string;
    askedBy?: PlayerId;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingPlayerEvent]: {
    selectedPlayers?: PlayerId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent]: {
    selectedPlayers?: PlayerId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForSkillUseEvent]: {
    invoke?: string;
    cardIds?: CardId[];
    toIds?: PlayerId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardDisplayEvent]: {
    selectedCards: CardId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardDropEvent]: {
    droppedCards: CardId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingCharacterEvent]: {
    chosenCharacterIds: CharacterId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForContinuouslyChoosingCardEvent]: {
    fromId: PlayerId;
    selectedCard: CardId;
  };
  [GameEventIdentifiers.AskForPlaceCardsInDileEvent]: {
    top: CardId[];
    bottom: CardId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardEvent]: {
    selectedCards: CardId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForFortuneCardExchangeEvent]: {
    doChange: boolean;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.PlayerStatusEvent]: {
    status: 'online' | 'offline' | 'quit' | 'trusted' | 'player';
    toId: PlayerId;
  };
  [GameEventIdentifiers.AskForPlayCardsOrSkillsEvent]: PlayCardOrSkillEvent;
  [GameEventIdentifiers.PlayerEnterRefusedEvent]: never;
  [GameEventIdentifiers.SyncGameCommonRulesEvent]: never;
  [GameEventIdentifiers.LoseSkillEvent]: never;
  [GameEventIdentifiers.ObtainSkillEvent]: never;
  [GameEventIdentifiers.GameReadyEvent]: never;
  [GameEventIdentifiers.HookUpSkillsEvent]: never;
  [GameEventIdentifiers.UnhookSkillsEvent]: never;
  [GameEventIdentifiers.BackToWaitingRoomEvent]: {
    playerId: PlayerId;
    playerName: string;
  };
}

type PlayCardOrSkillEvent =
  | {
      fromId: PlayerId;
      end: true;
    }
  | ({
      fromId: PlayerId;
      end: false | undefined;
    } & PlayerCardOrSkillInnerEvent);

export type PlayerCardOrSkillInnerEvent =
  | {
      eventName: GameEventIdentifiers.CardUseEvent;
      event: ClientEvent[GameEventIdentifiers.CardUseEvent];
    }
  | {
      eventName: GameEventIdentifiers.SkillUseEvent;
      event: ClientEvent[GameEventIdentifiers.SkillUseEvent];
    }
  | {
      eventName: GameEventIdentifiers.ReforgeEvent;
      event: ClientEvent[GameEventIdentifiers.ReforgeEvent];
    };

export interface WaitingRoomClientEvent extends WaitingRoomEventUtilities {
  [WaitingRoomEvent.GameInfoUpdate]: {
    roomInfo: WaitingRoomGameSettings;
  };
  [WaitingRoomEvent.PlayerChatMessage]: {
    from: string;
    messageContent: string;
  };
  [WaitingRoomEvent.GameStart]: {
    roomInfo: Pick<GameInfo, Exclude<keyof GameInfo, 'flavor'>> & { roomId?: number };
  };
  [WaitingRoomEvent.PlayerEnter]: {
    playerInfo: { playerId: PlayerId; avatarId: number; playerName: string };
    isHost: boolean;
    coreVersion: string;
  };
  [WaitingRoomEvent.PlayerLeave]: {
    leftPlayerId: PlayerId;
  };
  [WaitingRoomEvent.PlayerReady]: {
    readyPlayerId: PlayerId;
    isReady: boolean;
  };
  [WaitingRoomEvent.SeatDisabled]: {
    seatId: number;
    disabled: boolean;
    kickedPlayerId?: PlayerId;
  };
  [WaitingRoomEvent.RoomCreated]: {
    roomInfo: TemporaryRoomCreationInfo & { roomId?: number };
    hostPlayerId: PlayerId;
  };
  [WaitingRoomEvent.ChangeHost]: {
    prevHostPlayerId: PlayerId;
    newHostPlayerId: PlayerId;
  };
}
