import { CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import { DamageType } from 'core/game/game_props';
import {
  PlayerCardsArea,
  PlayerId,
  PlayerInfo,
} from 'core/player/player_props';
import { EventUtilities, GameEventIdentifiers, ServerEventFinder } from './event';

//@@todo: to be updated
export interface ServerEvent extends EventUtilities {
  [GameEventIdentifiers.CardUseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
  };
  [GameEventIdentifiers.CardEffectEvent]: {
    fromId?: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
  };
  [GameEventIdentifiers.AimEvent]: {
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
    who: PlayerId;
  };
  [GameEventIdentifiers.DamageEvent]: {
    fromId?: PlayerId;
    cardIds?: CardId[];
    damage: number;
    damageType: DamageType;
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
    carMatcher: CardMatcherSocketPassenger;
    byCardId?: CardId;
    cardUserId?: PlayerId;
  };

  [GameEventIdentifiers.AskForCardUseEvent]: {
    byCardId?: CardId;
    cardUserId?: PlayerId;
    carMatcher: CardMatcherSocketPassenger;
  };
  [GameEventIdentifiers.AskForPinDianCardEvent]: {
    from: PlayerId;
    otherTargets?: PlayerId[];
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {
    cardIds: CardId[];
  };
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
  [GameEventIdentifiers.AskForChooseOptionsEvent]: {
    options: string[],
    fromId: PlayerId,
  };
  [GameEventIdentifiers.AskForChoosPlayerEvent]: {
    players: PlayerId[],
    fromId: PlayerId,
  }
  [GameEventIdentifiers.AskForPlaceCardsInDileEvent]: {
    drawPendingCards?: CardId[];
    drawCards?: CardId[];
    placeCardsOnTop?: CardId[];
    placeCardsAtBottom?: CardId[];
    putCards?: CardId[];
  };
}

export type PinDianResultType = {
  winner: PlayerId | undefined;
  pindianCards: CardId[];
};
