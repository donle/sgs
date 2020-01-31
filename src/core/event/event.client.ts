import { CardId } from 'core/cards/libs/card_props';
import { DamageType } from 'core/game/game_props';
import { PlayerId, PlayerInfo } from 'core/player/player_props';
import { EventUtilities, GameEventIdentifiers } from './event';

export interface ClientEvent extends EventUtilities {
  [GameEventIdentifiers.CardUseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
    toIds?: PlayerId[];
  };
  [GameEventIdentifiers.CardResponseEvent]: {
    fromId: PlayerId;
    cardId: CardId;
  };
  [GameEventIdentifiers.CardDropEvent]: {
    fromId: PlayerId;
    cardIds: CardId[];
  };
  [GameEventIdentifiers.DrawCardEvent]: {};
  [GameEventIdentifiers.ObtainCardEvent]: {};
  [GameEventIdentifiers.MoveCardEvent]: {};

  [GameEventIdentifiers.SkillUseEvent]: {
    fromId: PlayerId;
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
    fromId: PlayerId;
    toId: PlayerId;
    recover: number;
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
  }

  [GameEventIdentifiers.AskForPeachEvent]: {};
  [GameEventIdentifiers.AskForWuXieKeJiEvent]: {};
  [GameEventIdentifiers.AskForCardResponseEvent]: {
    cardId?: CardId;
  };
  [GameEventIdentifiers.AskForChoosingCardEvent]: {};
  [GameEventIdentifiers.AskForChoosingCardFromPlayerEvent]: {};
  [GameEventIdentifiers.AskForCardUseEvent]: {};
  [GameEventIdentifiers.AskForCardDisplayEvent]: {};
  [GameEventIdentifiers.AskForCardDropEvent]: {};
  [GameEventIdentifiers.AskForChooseCharacterEvent]: {};
  [GameEventIdentifiers.AskForPlaceCardsInDileEvent]: {};
}
