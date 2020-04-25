import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import { DamageType, GameCommonRuleObject, GameInfo, GameRunningInfo } from 'core/game/game_props';
import { PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { PatchedTranslationObject } from 'core/translations/translation_json_tool';
import { CardLostReason, CardObtainedReason, EventUtilities, GameEventIdentifiers, ServerEventFinder } from './event';

export interface ServerEvent extends EventUtilities {
  [GameEventIdentifiers.SetFlagEvent]: {
    name: string;
    value: any;
    to: PlayerId;
    invisible: boolean;
  };
  [GameEventIdentifiers.RemoveFlagEvent]: {
    name: string;
    to: PlayerId;
  };
  [GameEventIdentifiers.ClearFlagEvent]: {
    to: PlayerId;
  };
  [GameEventIdentifiers.AddMarkEvent]: {
    name: string;
    value: number;
    to: PlayerId;
  };
  [GameEventIdentifiers.SetMarkEvent]: {
    name: string;
    value: number;
    to: PlayerId;
  };
  [GameEventIdentifiers.RemoveMarkEvent]: {
    name: string;
    to: PlayerId;
  };
  [GameEventIdentifiers.ClearMarkEvent]: {
    to: PlayerId;
  };

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
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
  };
  [GameEventIdentifiers.CardDropEvent]: {
    fromId: PlayerId;
    cardIds: CardId[];
    droppedBy: PlayerId;
  };
  [GameEventIdentifiers.CardLostEvent]: {
    fromId: PlayerId;
    cards: {
      fromArea?: PlayerCardsArea;
      cardId: CardId;
    }[];
    droppedBy?: PlayerId;
    reason: CardLostReason;
  };
  [GameEventIdentifiers.DrawCardEvent]: {
    fromId: PlayerId;
    drawAmount: number;
    askedBy: PlayerId;
  };
  [GameEventIdentifiers.ObtainCardEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    cardIds: CardId[];
    givenBy?: PlayerId;
    reason: CardObtainedReason;
  };
  [GameEventIdentifiers.MoveCardEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    fromArea?: PlayerCardsArea;
    toArea: PlayerCardsArea;
    cardIds: CardId[];
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
  [GameEventIdentifiers.ChangeMaxHpEvent]: {
    additionalMaxHp: number;
    toId: PlayerId;
  };
  [GameEventIdentifiers.DamageEvent]: {
    fromId?: PlayerId;
    cardIds?: CardId[];
    damage: number;
    damageType: DamageType;
    triggeredBySkills: string[];
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
    bySkill?: string;
    byCard?: CardId;
    judgeCardId: CardId;
  };
  [GameEventIdentifiers.PinDianEvent]: {
    attackerId: PlayerId;
    result: PinDianResultType;
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
    loserIds: PlayerId[];
    winnerIds: PlayerId[];
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
    playerId: PlayerId;
    killedBy?: PlayerId;
  };

  [GameEventIdentifiers.AskForPeachEvent]: {
    fromId: PlayerId;
    toId: PlayerId;
    conversation: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.AskForCardResponseEvent]: {
    toId: PlayerId;
    cardMatcher: CardMatcherSocketPassenger;
    byCardId?: CardId;
    cardUserId?: PlayerId;
    fromArea?: PlayerCardsArea[];
    conversation: string | PatchedTranslationObject;
    triggeredOnEvent?: ServerEventFinder<GameEventIdentifiers>;
  };

  [GameEventIdentifiers.AskForCardUseEvent]: {
    toId: PlayerId;
    byCardId?: CardId;
    cardUserId?: PlayerId;
    scopedTargets?: string[];
    extraUse?: boolean;
    cardMatcher: CardMatcherSocketPassenger;
    conversation: string | PatchedTranslationObject;
    triggeredOnEvent?: ServerEventFinder<GameEventIdentifiers>;
  };
  [GameEventIdentifiers.AskForPinDianCardEvent]: {
    fromId: PlayerId;
    toIds: PlayerId[];
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {
    cardIds: CardId[] | number;
    toId: PlayerId;
    cardMatcher?: CardMatcherSocketPassenger;
  };
  [GameEventIdentifiers.AskForChoosingCardFromPlayerEvent]: {
    fromId: PlayerId;
    toId: PlayerId;
    options: CardChoosingOptions;
  };
  [GameEventIdentifiers.AskForSkillUseEvent]: {
    invokeSkillNames: string[];
    toId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardDisplayEvent]: {
    cardMatcher: CardMatcherSocketPassenger;
    cardAmount: number;
    toId: PlayerId;
    conversation: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.AskForCardDropEvent]: {
    fromArea: PlayerCardsArea[];
    except?: CardId[];
    cardAmount: number;
    toId: PlayerId;
    conversation?: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.AskForChoosingCharacterEvent]: {
    characterIds: CharacterId[];
    lordInfo?: {
      lordId: PlayerId;
      lordCharacter: CharacterId;
    };
    role?: PlayerRole;
    isGameStart?: boolean;
  };
  [GameEventIdentifiers.AskForChoosingOptionsEvent]: {
    askedBy?: PlayerId;
    options: string[];
    conversation: string | PatchedTranslationObject;
    toId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingPlayerEvent]: {
    players: PlayerId[];
    toId: PlayerId;
    requiredAmount: number;
    conversation: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.AskForPlaceCardsInDileEvent]: {
    movableCards: CardId[];
    top: number;
    topStackName: string;
    bottom: number;
    bottomStackName: string;
    toId: PlayerId;
  };
  [GameEventIdentifiers.PhaseChangeEvent]: {
    from: PlayerPhase | undefined;
    to: PlayerPhase;
    fromPlayer: PlayerId | undefined;
    toPlayer: PlayerId;
  };
  [GameEventIdentifiers.PhaseStageChangeEvent]: {
    toStage: PlayerPhaseStages;
    playerId: PlayerId;
  };
  [GameEventIdentifiers.AskForPlayCardsOrSkillsEvent]: {
    toId: PlayerId;
  };
  [GameEventIdentifiers.SyncGameCommonRulesEvent]: {
    toId: PlayerId;
    commonRules: GameCommonRuleObject;
  };
  [GameEventIdentifiers.LoseSkillEvent]: {
    skillName: string;
    toId: PlayerId;
    includeStatusSkill?: boolean;
  };
  [GameEventIdentifiers.ObtainSkillEvent]: {
    skillName: string;
    toId: PlayerId;
  };
  [GameEventIdentifiers.DrunkEvent]: {
    toId: PlayerId;
    drunk: boolean;
  };
  [GameEventIdentifiers.ChainLinkedEvent]: {
    toId: PlayerId;
    linked: boolean;
  };
  [GameEventIdentifiers.AskForContinuouslyChoosingCardEvent]: {
    cardIds: CardId[];
    selected: { card: CardId; player?: PlayerId }[];
    toId: PlayerId;
    userId?: PlayerId;
  };
  [GameEventIdentifiers.PlayerTurnOverEvent]: {
    toId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardEvent]: {
    toId: PlayerId;
    cardMatcher: CardMatcherSocketPassenger;
    cardAmount: number;
    reason: string;
    fromArea: PlayerCardsArea[];
    conversation: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.CustomGameDialog]: {};
}

export type PinDianResultType = {
  winner: PlayerId | undefined;
  pindianCards: {
    fromId: PlayerId;
    cardId: CardId;
  }[];
};
