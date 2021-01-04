import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CharacterGender, CharacterId, CharacterNationality } from 'core/characters/character';
import { DamageType, GameCommonRuleObject, GameInfo, GameRunningInfo } from 'core/game/game_props';
import { PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerInfo } from 'core/player/player_props';
import { JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { System } from 'core/shares/libs/system';
import { RoomInfo } from 'core/shares/types/server_types';
import { PatchedTranslationObject } from 'core/translations/translation_json_tool';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  EventUtilities,
  GameEventIdentifiers,
  ServerEventFinder,
} from './event';

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
  [GameEventIdentifiers.CardUseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
    toCardIds?: CardId[];
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
    skipDrop?: boolean;
    nullifiedTargets?: PlayerId[];
    extraUse?: boolean;
  };
  [GameEventIdentifiers.CardEffectEvent]: {
    fromId?: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
    toCardIds?: CardId[];
    allTargets?: PlayerId[];
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
    nullifiedTargets?: PlayerId[];
    isCancelledOut?: boolean;
  };
  [GameEventIdentifiers.AimEvent]: {
    fromId: string;
    bySkill?: string;
    byCardId?: CardId;
    allTargets: PlayerId[];
    toId: PlayerId;
    nullifiedTargets: PlayerId[];
    isFirstTarget?: boolean;
  };
  [GameEventIdentifiers.CardResponseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
    skipDrop?: boolean;
    mute?: boolean;
  };
  [GameEventIdentifiers.DrawCardEvent]: {
    fromId: PlayerId;
    drawAmount: number;
    askedBy: PlayerId;
    bySpecialReason?: CardDrawReason;
    from?: 'top' | 'bottom';
  };
  [GameEventIdentifiers.MoveCardEvent]: {
    movingCards: {
      card: CardId;
      fromArea?: CardMoveArea | PlayerCardsArea;
      asideMove?: boolean;
    }[];
    fromId?: PlayerId;
    moveReason: CardMoveReason;
    toId?: PlayerId;
    toArea: CardMoveArea | PlayerCardsArea;
    proposer?: PlayerId;
    toOutsideArea?: string;
    isOutsideAreaInPublic?: boolean;
    movedByReason?: string;
    hideBroadcast?: boolean;
    placeAtTheBottomOfDrawStack?: boolean;
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
    mute?: boolean;
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
  [GameEventIdentifiers.HpChangeEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    amount: number;
    byReaon: 'damage' | 'lostHp' | 'recover';
    byCardIds?: CardId[];
    beginnerOfTheDamage?: PlayerId;
  };
  [GameEventIdentifiers.DamageEvent]: {
    fromId?: PlayerId;
    cardIds?: CardId[];
    damage: number;
    damageType: DamageType;
    triggeredBySkills: string[];
    toId: PlayerId;
    isFromChainedDamage?: boolean;
    beginnerOfTheDamage?: PlayerId;
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
    realJudgeCardId: CardId;
    judgeMatcherEnum?: JudgeMatcherEnum;
  };
  [GameEventIdentifiers.PinDianEvent]: {
    fromId: PlayerId;
    cardId?: CardId;
    toIds: PlayerId[];
    procedures: PinDianProcedure[];
    randomPinDianCardPlayer: PlayerId[];
  };
  [GameEventIdentifiers.UserMessageEvent]: {
    playerId: PlayerId;
    message: string;
    originalMessage: string;
  };
  [GameEventIdentifiers.GameReadyEvent]: {
    gameInfo: GameInfo;
    gameStartInfo: GameRunningInfo;
    playersInfo: PlayerInfo[];
  };
  [GameEventIdentifiers.GameStartEvent]: {
    players: PlayerInfo[];
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
  [GameEventIdentifiers.PlayerReenterEvent]: {
    toId: PlayerId;
  };
  [GameEventIdentifiers.PlayerBulkPacketEvent]: {
    stackedLostMessages: ServerEventFinder<GameEventIdentifiers>[];
    timestamp: number;
  };
  [GameEventIdentifiers.PlayerLeaveEvent]: {
    playerId: PlayerId;
    quit?: boolean;
  };
  [GameEventIdentifiers.PlayerDyingEvent]: {
    dying: PlayerId;
    killedBy?: PlayerId;
    rescuer?: PlayerId;
  };
  [GameEventIdentifiers.PlayerDiedEvent]: {
    playerId: PlayerId;
    killedBy?: PlayerId;
  };
  [GameEventIdentifiers.ObserveCardsEvent]: {
    cardIds: CardId[];
    selected: { card: CardId; player?: PlayerId }[];
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
    responsedEvent?: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent>;
  };

  [GameEventIdentifiers.AskForCardUseEvent]: {
    toId: PlayerId;
    byCardId?: CardId;
    cardUserId?: PlayerId;
    scopedTargets?: string[];
    extraUse?: boolean;
    cardMatcher: CardMatcherSocketPassenger;
    conversation: string | PatchedTranslationObject;
    commonUse?: boolean;
    triggeredOnEvent?: ServerEventFinder<GameEventIdentifiers>;
    responsedEvent?: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
  };
  [GameEventIdentifiers.AskForPinDianCardEvent]: {
    fromId: PlayerId;
    toId: PlayerId;
    conversation: string | PatchedTranslationObject;
    randomPinDianCard?: boolean;
  };
  [GameEventIdentifiers.AskForChoosingCardWithConditionsEvent]: {
    cardIds?: CardId[] | number;
    customCardFields?: {
      [fieldName in string | number]: CardId[] | number;
    };
    customMessage?: string;
    customTitle?: string;
    cardFilter?: System.AskForChoosingCardEventFilter;
    toId: PlayerId;
    involvedTargets?: PlayerId[];
    amount?: number | [number, number];
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {
    cardIds?: CardId[] | number;
    customCardFields?: {
      [fieldName in string | number]: CardId[] | number;
    };
    customTitle?: string;
    toId: PlayerId;
    cardMatcher?: CardMatcherSocketPassenger;
    amount: number;
  };
  [GameEventIdentifiers.AskForChoosingCardFromPlayerEvent]: {
    fromId: PlayerId;
    toId: PlayerId;
    options: CardChoosingOptions;
    customTitle?: string;
  };
  [GameEventIdentifiers.AskForSkillUseEvent]: {
    invokeSkillNames: string[];
    toId: PlayerId;
    conversation?: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.AskForCardDisplayEvent]: {
    cardMatcher?: CardMatcherSocketPassenger;
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
    responsedEvent?: ClientEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
  };
  [GameEventIdentifiers.AskForChoosingCharacterEvent]: {
    amount: number;
    characterIds: CharacterId[];
    toId: PlayerId;
    byHuaShen?: boolean;
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
    cardIds: CardId[];
    top: number;
    topStackName: string;
    bottom: number;
    bottomStackName: string;
    toId: PlayerId;
    movable: boolean;
    topMaxCard?: number;
    topMinCard?: number;
    bottomMaxCard?: number;
    bottomMinCard?: number;
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
    skillName: string | string[];
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
  [GameEventIdentifiers.ChainLockedEvent]: {
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
    cardMatcher?: CardMatcherSocketPassenger;
    cardAmount?: number;
    cardAmountRange?: [number, number];
    reason: string;
    fromArea: PlayerCardsArea[];
    conversation: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.CustomGameDialog]: {};
  [GameEventIdentifiers.NotifyEvent]: {
    toIds: PlayerId[];
    notificationTime: number;
  };
  [GameEventIdentifiers.PlayerStatusEvent]: {
    status: 'online' | 'offline' | 'quit' | 'trusted' | 'player';
    toId: PlayerId;
  };
  [GameEventIdentifiers.PhaseSkippedEvent]: {
    playerId: PlayerId;
    skippedPhase: PlayerPhase;
  };
  [GameEventIdentifiers.PlayerPropertiesChangeEvent]: {
    changedProperties: {
      toId: PlayerId;
      characterId?: CharacterId;
      maxHp?: number;
      hp?: number;
      nationality?: CharacterNationality;
      gender?: CharacterGender;
      handCards?: CardId[];
      equips?: CardId[];
    }[];
  };
  [GameEventIdentifiers.SetOutsideCharactersEvent]: {
    toId: PlayerId;
    characterIds: CharacterId[];
    areaName: string;
    isPublic?: boolean;
  };
  [GameEventIdentifiers.HuaShenCardUpdatedEvent]: {
    latestHuaShen: CharacterId;
    latestHuaShenSkillName: string;
    toId: PlayerId;
  };
  [GameEventIdentifiers.UpgradeSideEffectSkillsEvent]: {
    sideEffectSkillApplier: System.SideEffectSkillApplierEnum;
    skillName: string | undefined;
  };
}

export type PinDianProcedure = {
  toId: PlayerId;
  cardId: CardId;
  winner?: PlayerId;
};

export type PinDianReport = {
  pindianCardId?: CardId;
  pindianRecord: PinDianProcedure[];
};
