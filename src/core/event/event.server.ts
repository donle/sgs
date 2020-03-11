import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import {
  DamageType,
  GameCommonRuleObject,
  GameInfo,
  GameRunningInfo,
} from 'core/game/game_props';
import { PlayerPhase } from 'core/game/stage_processor';
import {
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
  PlayerRole,
} from 'core/player/player_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { PatchedTranslationObject } from 'core/translations/translation_json_tool';
import {
  EventUtilities,
  GameEventIdentifiers,
  ServerEventFinder,
} from './event';

export interface ServerEvent extends EventUtilities {
  [GameEventIdentifiers.EquipEvent]: {
    fromId: PlayerId;
    cardId: CardId;
  };
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
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
  };
  [GameEventIdentifiers.AimEvent]: {
    fromId: string;
    bySkill?: string;
    byCardId?: CardId;
    toIds: PlayerId[];
  };
  [GameEventIdentifiers.CardResponseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
  };
  [GameEventIdentifiers.CardDropEvent]: {
    fromId: PlayerId;
    cardIds: CardId[];
    droppedBy: PlayerId;
  };
  [GameEventIdentifiers.CardLoseEvent]: {
    fromId: PlayerId;
    cardIds: CardId[];
    droppedBy?: PlayerId;
  };
  [GameEventIdentifiers.DrawCardEvent]: {
    playerId: PlayerId;
    cardIds: CardId[];
    askedBy: PlayerId;
  };
  [GameEventIdentifiers.ObtainCardEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    cardIds: CardId[];
    givenBy?: PlayerId;
  };
  [GameEventIdentifiers.MoveCardEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    fromArea: PlayerCardsArea;
    toArea: PlayerCardsArea;
    cardId: CardId;
  };
  [GameEventIdentifiers.CardDisplayEvent]: {
    displayCards: CardId[];
    fromId?: PlayerId;
  };

  [GameEventIdentifiers.SkillUseEvent]: {
    fromId: PlayerId;
    skillName: string;
    cardIds?: CardId[];
    toIds?: PlayerId[];
    triggeredOnEvent?: ServerEventFinder<GameEventIdentifiers>;
  };
  [GameEventIdentifiers.SkillEffectEvent]: {
    fromId: PlayerId;
    skillName: string;
    cardIds?: CardId[];
    toIds?: PlayerId[];
    triggeredOnEvent?: ServerEventFinder<GameEventIdentifiers>;
  };
  [GameEventIdentifiers.LoseHpEvent]: {
    lostHp: number;
    toId: PlayerId;
  };
  [GameEventIdentifiers.DamageEvent]: {
    fromId?: PlayerId;
    cardIds?: CardId[];
    damage: number;
    damageType: DamageType;
    triggeredBySkillName: string;
    toId: PlayerId;
  };
  [GameEventIdentifiers.RecoverEvent]: {
    recoverBy?: PlayerId;
    cardIds?: CardId[];
    recoveredHp: number;
    toId: PlayerId;
  };
  [GameEventIdentifiers.JudgeEvent]: {
    toId: PlayerId;
    cardId: CardId;
    judgeCardId: CardId;
  };
  [GameEventIdentifiers.PinDianEvent]: {
    attackerId: PlayerId;
    displayedCardIdByAttacker: CardId;
    targetId: PlayerId;
    displayedCardIdByTarget: CardId;
  };

  [GameEventIdentifiers.UserMessageEvent]: {
    playerId: PlayerId;
  };
  [GameEventIdentifiers.GameReadyEvent]: {
    gameInfo: GameInfo;
    gameStartInfo: GameRunningInfo;
    playersInfo: PlayerInfo[];
  };
  [GameEventIdentifiers.GameStartEvent]: {
    currentPlayer: PlayerInfo;
    otherPlayers: PlayerInfo[];
  };
  [GameEventIdentifiers.GameOverEvent]: {
    playersInfo: PlayerInfo[];
  };
  [GameEventIdentifiers.PlayerEnterRefusedEvent]: {
    playerId: PlayerId;
    playerName: string;
    timestamp: number;
  };
  [GameEventIdentifiers.PlayerEnterEvent]: {
    joiningPlayerName: string;
    joiningPlayerId: PlayerId;
    playersInfo: PlayerInfo[];
    roomInfo: RoomInfo;
    gameInfo: GameInfo;
    timestamp: number;
  };
  [GameEventIdentifiers.PlayerLeaveEvent]: {
    playerId: PlayerId;
  };
  [GameEventIdentifiers.PlayerDyingEvent]: {
    dying: PlayerId;
    killedBy?: PlayerId;
  };
  [GameEventIdentifiers.PlayerDiedEvent]: {
    playerInfo: PlayerInfo;
    killedBy?: PlayerId;
  };

  [GameEventIdentifiers.AskForPeachEvent]: {
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardResponseEvent]: {
    cardMatcher: CardMatcherSocketPassenger;
    byCardId?: CardId;
    cardUserId?: PlayerId;
    conversation: string | PatchedTranslationObject,
  };

  [GameEventIdentifiers.AskForCardUseEvent]: {
    byCardId?: CardId;
    cardUserId?: PlayerId;
    cardMatcher: CardMatcherSocketPassenger;
    conversation: string | PatchedTranslationObject,
  };
  [GameEventIdentifiers.AskForPinDianCardEvent]: {
    from: PlayerId;
    otherTargets?: PlayerId[];
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {
    cardIds: CardId[];
  };
  [GameEventIdentifiers.AskForChoosingCardFromPlayerEvent]: {
    fromId: PlayerId;
    toId: PlayerId;
    options: CardChoosingOptions;
  };
  [GameEventIdentifiers.AskForInvokeEvent]: {
    invokeSkillNames: string[];
    to: PlayerId;
  };
  [GameEventIdentifiers.AskForCardDisplayEvent]: {
    cardMatcher?: CardMatcherSocketPassenger;
    cardAmount?: number;
  };
  [GameEventIdentifiers.AskForCardDropEvent]: {
    fromArea: [PlayerCardsArea];
    cardAmount: number;
    toId: PlayerId;
  };
  [GameEventIdentifiers.AskForChooseCharacterEvent]: {
    characterIds: CharacterId[];
    lordInfo?: {
      lordId: PlayerId;
      lordCharacter: CharacterId;
    };
    role?: PlayerRole;
    isGameStart?: boolean;
  };
  [GameEventIdentifiers.AskForChooseOptionsEvent]: {
    options: string[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosePlayerEvent]: {
    players: PlayerId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForPlaceCardsInDileEvent]: {
    drawPendingCards?: CardId[];
    drawCards?: CardId[];
    placeCardsOnTop?: CardId[];
    placeCardsAtBottom?: CardId[];
    putCards?: CardId[];
  };
  [GameEventIdentifiers.PhaseChangeEvent]: {
    from: PlayerPhase | undefined;
    to: PlayerPhase;
    fromPlayer: PlayerId | undefined;
    toPlayer: PlayerId;
  };
  [GameEventIdentifiers.AskForPlayCardsOrSkillsEvent]: {
    fromId: PlayerId;
  };
  [GameEventIdentifiers.SyncGameCommonRulesEvent]: {
    toId: PlayerId;
    commonRules: GameCommonRuleObject;
  };
  [GameEventIdentifiers.LoseSkillEvent]: {
    skillName: string;
    toId: PlayerId;
  };
  [GameEventIdentifiers.ObtainSkillEvent]: {
    skillName: string;
    toId: PlayerId;
  };
}

export type PinDianResultType = {
  winner: PlayerId | undefined;
  pindianCards: CardId[];
};
