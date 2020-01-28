import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import { DamageType } from 'core/game/game_props';
import {
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
} from 'core/player/player_props';
import { EventUtilities, GameEventIdentifiers } from './event';

//@@todo: to be updated
export interface ServerEvent extends EventUtilities {
  [GameEventIdentifiers.CardUseEvent]: {
    fromId?: PlayerId;
    cardId: CardId;
    toId?: PlayerId;
  };
  [GameEventIdentifiers.CardResponseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
  };
  [GameEventIdentifiers.CardDropEvent]: {
    fromId: PlayerId;
    cardIds: CardId[];
  };
  [GameEventIdentifiers.DrawCardEvent]: {
    playerId: PlayerId;
    cardIds: CardId[];
  };
  [GameEventIdentifiers.ObtainCardEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    cardIds: CardId[];
  };
  [GameEventIdentifiers.MoveCardEvent]: {
    fromId?: PlayerId;
    toId: PlayerId;
    fromArea: PlayerCardsArea;
    toArea: PlayerCardsArea;
  };
  [GameEventIdentifiers.CardDisplayEvent]: {
    displayCards: CardId[];
    fromId?: PlayerId;
  };

  [GameEventIdentifiers.AimEvent]: {
    bySkill?: string;
    byCardId?: CardId;
    toIds: PlayerId[];
  };
  [GameEventIdentifiers.AimmedEvent]: {
    bySkill?: string;
    byCardId?: CardId;
    toOthers: PlayerId[];
  };

  [GameEventIdentifiers.SkillUseEvent]: {
    fromId: PlayerId;
    skillName: string;
    cardIds?: CardId[];
    toIds?: PlayerId[];
  };
  [GameEventIdentifiers.DamageEvent]: {
    fromId?: PlayerId;
    cardIds?: CardId[];
    damage: number;
    damageType: DamageType;
    toId: PlayerId;
  };
  [GameEventIdentifiers.RecoverEvent]: {
    recoverBy: PlayerId;
    cardIds?: CardId[];
    recoveredHp: number;
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

  [GameEventIdentifiers.GameStartEvent]: {
    currentPlayer: PlayerInfo;
    otherPlayers: PlayerInfo[];
  };
  [GameEventIdentifiers.GameOverEvent]: {
    playersInfo: PlayerInfo[];
  };

  [GameEventIdentifiers.PlayerEnterEvent]: {
    playerInfo: PlayerInfo;
  };
  [GameEventIdentifiers.PlayerLeaveEvent]: {
    playerId: PlayerId;
  };
  [GameEventIdentifiers.PlayerDiedEvent]: {
    playerInfo: PlayerInfo;
  };

  [GameEventIdentifiers.AskForPeachEvent]: {
    fromId: PlayerId;
    amount: number;
  };
  [GameEventIdentifiers.AskForWuXieKeJiEvent]: {
    fromId?: PlayerId;
    cardId?: CardId;
    cardName: string;
  };
  [GameEventIdentifiers.AskForCardResponseEvent]: {
    macther: CardMatcherSocketPassenger;
    byCardId?: CardId;
    cardUserId?: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {};
  [GameEventIdentifiers.AskForChoosingCardFromPlayerEvent]: {
    chooseFromId?: PlayerId;
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
  };
  [GameEventIdentifiers.AskForChooseCharacterEvent]: {
    characterIds: CharacterId[];
  };
  [GameEventIdentifiers.AskForPlaceCardsInDileEvent]: {
    drawPendingCards?: CardId[];
    placeCardsOnTop?: CardId[];
    placeCardsAtBottom?: CardId[];
  };
}
