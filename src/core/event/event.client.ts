import { CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import { DamageType } from 'core/game/game_props';
import { PlayerId, PlayerInfo } from 'core/player/player_props';
import { EventUtilities, GameEventIdentifiers } from './event';

export interface ClientEvent extends EventUtilities {
  [GameEventIdentifiers.CardUseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
    toCardIds?: CardId[];
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
  [GameEventIdentifiers.CardDropEvent]: {
    fromId: PlayerId;
    cardIds: CardId[];
  };
  [GameEventIdentifiers.DrawCardEvent]: {
    playerId: PlayerId;
    numberOfCards: number;
  };
  [GameEventIdentifiers.ObtainCardEvent]: {};
  [GameEventIdentifiers.MoveCardEvent]: {};

  [GameEventIdentifiers.SkillUseEvent]: {
    fromId: PlayerId;
    skillName: string;
    cardIds?: CardId[];
    toIds?: PlayerId[];
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
  };

  [GameEventIdentifiers.GameStartEvent]: {
    currentPlayer: PlayerInfo;
    otherPlayers: PlayerInfo[];
  };
  [GameEventIdentifiers.GameOverEvent]: {
    playersInfo: PlayerInfo[];
  };

  [GameEventIdentifiers.PlayerEnterEvent]: {
    playerName: string;
  };
  [GameEventIdentifiers.PlayerLeaveEvent]: {
    playerId: PlayerId;
  };
  [GameEventIdentifiers.PlayerDiedEvent]: {
    playerInfo: PlayerInfo;
  };
  [GameEventIdentifiers.AskForPinDianCardEvent]: {
    pindianCard: CardId;
    from: PlayerId;
  };

  [GameEventIdentifiers.AskForPeachEvent]: {
    cardId?: CardId;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForWuXieKeJiEvent]: {
    cardId?: CardId;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardResponseEvent]: {
    cardId?: CardId;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {};
  [GameEventIdentifiers.AskForChoosingCardFromPlayerEvent]: {};
  [GameEventIdentifiers.AskForCardUseEvent]: {
    cardId?: CardId;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChooseOptionsEvent]: {
    selectedOption?: string;
    askedBy?: PlayerId;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChoosePlayerEvent]: {
    selectedPlayer?: PlayerId;
    fromId: PlayerId;
    askedBy?: PlayerId;
  };
  [GameEventIdentifiers.AskForInvokeEvent]: {
    invoke?: string;
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForCardDisplayEvent]: {};
  [GameEventIdentifiers.AskForCardDropEvent]: {
    droppedCards: CardId[];
    fromId: PlayerId;
  };
  [GameEventIdentifiers.AskForChooseCharacterEvent]: {
    chosenCharacter: CharacterId;
    fromId: PlayerId;
    isGameStart?: boolean;
  };
  [GameEventIdentifiers.AskForPlaceCardsInDileEvent]: {};
  [GameEventIdentifiers.AskForPlayCardsOrSkillsEvent]: {
    fromId: PlayerId;
    end?: boolean;
    event?:
      | ClientEvent[GameEventIdentifiers.SkillUseEvent]
      | ClientEvent[GameEventIdentifiers.CardUseEvent];
  };
  [GameEventIdentifiers.SyncGameCommonRulesEvent]: never;
}
