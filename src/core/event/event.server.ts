import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CharacterEquipSections, CharacterGender, CharacterId, CharacterNationality } from 'core/characters/character';
import {
  DamageType,
  GameCommonRuleObject,
  GameInfo,
  GameRunningInfo,
  TemporaryRoomCreationInfo,
  WaitingRoomGameSettings,
} from 'core/game/game_props';
import { PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerShortcutInfo } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { System } from 'core/shares/libs/system';
import { AimGroup } from 'core/shares/libs/utils/aim_group';
import { TargetGroup } from 'core/shares/libs/utils/target_group';
import { RoomInfo, RoomShortcutInfo } from 'core/shares/types/server_types';
import { PatchedTranslationObject } from 'core/translations/translation_json_tool';
import {
  BaseGameEvent,
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  EventUtilities,
  GameEventIdentifiers,
  ServerEventFinder,
  WaitingRoomEvent,
  WaitingRoomEventUtilities,
} from './event';

export type MovingCardProps = {
  card: CardId;
  fromArea?: CardMoveArea | PlayerCardsArea;
  asideMove?: boolean;
};

export type MoveCardEventInfos = {
  movingCards: MovingCardProps[];
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
} & BaseGameEvent;

export type OptionPromptProps = {
  option: string;
  optionDetail?: string;
  sideTip?: string | PatchedTranslationObject;
};

export interface ServerEvent extends EventUtilities {
  [GameEventIdentifiers.SetFlagEvent]: {
    name: string;
    value: any;
    to: PlayerId;
    tagName?: string;
    visiblePlayers?: PlayerId[];
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
    targetGroup?: TargetGroup;
    toCardIds?: CardId[];
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
    nullifiedTargets?: PlayerId[];
    extraUse?: boolean;
    withoutInvokes?: boolean;
    disresponsiveList?: PlayerId[];
    unoffsetable?: PlayerId[];
    additionalDamage?: number;
    additionalRecoveredHp?: number;
    customFromArea?: CardMoveArea;
    customFromId?: PlayerId;
    cardIdsResponded?: CardId[];
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
    disresponsiveList?: PlayerId[];
    additionalDamage?: number;
    additionalRecoveredHp?: number;
    cardIdsResponded?: CardId[];
    disresponsiveCards?: string[];
  };
  [GameEventIdentifiers.AimEvent]: {
    fromId: string;
    bySkill?: string;
    byCardId: CardId;
    allTargets: AimGroup;
    toId: PlayerId;
    targetGroup?: TargetGroup;
    nullifiedTargets: PlayerId[];
    isFirstTarget: boolean;
    additionalDamage?: number;
    additionalRecoveredHp?: number;
    extraUse?: boolean;
  };
  [GameEventIdentifiers.CardResponseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
    responseToEvent?: ServerEventFinder<GameEventIdentifiers>;
    withoutInvokes?: boolean;
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
    infos: MoveCardEventInfos[];
  };
  [GameEventIdentifiers.CardDisplayEvent]: {
    displayCards: CardId[];
    fromId?: PlayerId;
    toIds?: PlayerId[];
  };

  [GameEventIdentifiers.SkillUseEvent]: {
    fromId: PlayerId;
    skillName: string;
    cardIds?: CardId[];
    toIds?: PlayerId[];
    triggeredOnEvent?: ServerEventFinder<GameEventIdentifiers>;
    mute?: boolean;
    audioIndex?: number;
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
  [GameEventIdentifiers.ArmorChangeEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    amount: number;
    leftDamage: number;
    byCardIds?: CardId[];
    beginnerOfTheDamage?: PlayerId;
    damageType?: DamageType;
  };
  [GameEventIdentifiers.HpChangeEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    amount: number;
    byReaon: 'damage' | 'lostHp' | 'recover';
    byCardIds?: CardId[];
    beginnerOfTheDamage?: PlayerId;
    damageType?: DamageType;
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
  [GameEventIdentifiers.GameBeginEvent]: {};
  [GameEventIdentifiers.CircleStartEvent]: {};
  [GameEventIdentifiers.LevelBeginEvent]: {};
  [GameEventIdentifiers.AskForFortuneCardExchangeEvent]: {
    conversation: string | PatchedTranslationObject;
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
  [GameEventIdentifiers.ObserverEnterEvent]: {
    joiningPlayerName: string;
    joiningPlayerId: PlayerId;
    playersInfo: PlayerShortcutInfo[];
    roomInfo: RoomShortcutInfo;
    gameInfo: GameInfo;
    timestamp: number;
    observePlayerId: PlayerId;
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
    killedByCards?: CardId[];
    rescuer?: PlayerId;
  };
  [GameEventIdentifiers.PlayerDiedEvent]: {
    playerId: PlayerId;
    killedBy?: PlayerId;
    killedByCards?: CardId[];
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
    triggeredOnEvent?: ServerEventFinder<GameEventIdentifiers>;
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
    hideExclusive?: boolean;
    cardAmount: number | [number, number];
    toId: PlayerId;
    conversation?: string | PatchedTranslationObject;
    responsedEvent?: ClientEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
  };
  [GameEventIdentifiers.AskForChoosingCharacterEvent]: {
    amount: number;
    characterIds: CharacterId[];
    toId: PlayerId;
    conversation?: string | PatchedTranslationObject;
    byHuaShen?: boolean;
  };
  [GameEventIdentifiers.AskForChoosingOptionsEvent]: {
    askedBy?: PlayerId;
    options: string[];
    conversation: string | PatchedTranslationObject;
    toId: PlayerId;
    optionPrompt?: OptionPromptProps[];
  };
  [GameEventIdentifiers.AskForChoosingPlayerEvent]: {
    players: PlayerId[];
    toId: PlayerId;
    requiredAmount: number | [number, number];
    conversation: string | PatchedTranslationObject;
  };
  [GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent]: {
    user: PlayerId;
    cardId: CardId;
    exclude: PlayerId[];
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
    insertIndex?: number;
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
    status: 'online' | 'offline' | 'quit' | 'trusted' | 'player' | 'smart-ai';
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
      armor?: number;
      maxHp?: number;
      hp?: number;
      nationality?: CharacterNationality;
      gender?: CharacterGender;
      handCards?: CardId[];
      equips?: CardId[];
      playerPosition?: number;
      activate?: boolean;
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
    sourceId?: PlayerId | undefined;
  };
  [GameEventIdentifiers.AbortOrResumePlayerSectionsEvent]: {
    toId: PlayerId;
    isResumption?: boolean;
    toSections: CharacterEquipSections[];
  };
  [GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent]: {
    toId: PlayerId;
    isResumption?: boolean;
  };
  [GameEventIdentifiers.RefreshOnceSkillEvent]: {
    toId: PlayerId;
    skillName: string;
  };
  [GameEventIdentifiers.HookUpSkillsEvent]: {
    toId: PlayerId;
    skillNames: string[];
  };
  [GameEventIdentifiers.UnhookSkillsEvent]: {
    toId: PlayerId;
    skillNames: string[];
  };
  [GameEventIdentifiers.BackToWaitingRoomEvent]: {
    playerId: PlayerId;
    playerName: string;
    roomInfo: TemporaryRoomCreationInfo;
    roomId: RoomId;
  };
  [GameEventIdentifiers.SetCardTagEvent]: {
    toId: PlayerId;
    cardTag: string;
    cardIds: CardId[];
  };
  [GameEventIdentifiers.RemoveCardTagEvent]: {
    toId: PlayerId;
    cardTag: string;
  };
  [GameEventIdentifiers.ClearCardTagsEvent]: {
    toId: PlayerId;
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

export interface WaitingRoomServerEvent extends WaitingRoomEventUtilities {
  [WaitingRoomEvent.GameInfoUpdate]: {
    roomInfo: WaitingRoomGameSettings;
  };
  [WaitingRoomEvent.PlayerChatMessage]: {
    from: string;
    messageContent: string;
    timestamp: number;
  };
  [WaitingRoomEvent.GameStart]: {
    roomId: RoomId;
    otherPlayersId: PlayerId[];
    roomInfo: GameInfo;
  };
  [WaitingRoomEvent.PlayerEnter]: {
    hostPlayerId: PlayerId;
    playerInfo: { playerId: PlayerId; avatarId: number; playerName: string; seatId: number };
    otherPlayersInfo: {
      playerId: PlayerId;
      avatarId: number;
      playerName: string;
      seatId: number;
      playerReady: boolean;
    }[];
    roomInfo: TemporaryRoomCreationInfo;
    disableSeats: number[];
  };
  [WaitingRoomEvent.PlayerLeave]: {
    leftPlayerId: PlayerId;
    byKicked: boolean;
    newHostPlayerId?: PlayerId;
  };
  [WaitingRoomEvent.PlayerReady]: {
    readyPlayerId: PlayerId;
    isReady: boolean;
  };
  [WaitingRoomEvent.SeatDisabled]: {
    seatId: number;
    disabled: boolean;
  };
  [WaitingRoomEvent.RoomCreated]:
    | {
        roomId: RoomId;
        roomInfo: TemporaryRoomCreationInfo;
        hostPlayerId: PlayerId;
        disabledSeats: number[];
        error: null;
      }
    | { error: string };
  [WaitingRoomEvent.ChangeHost]: {
    prevHostPlayerId: PlayerId;
    newHostPlayerId: PlayerId;
  };
}
