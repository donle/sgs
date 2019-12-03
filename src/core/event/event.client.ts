import { CardId } from 'core/cards/card';
import { GameInfo } from 'core/game/game_props';
import { ClientViewPlayer, PlayerId } from 'core/player/player_props';
import { EventUtilities, GameEventIdentifiers } from './event';

export interface ClientEvent extends EventUtilities {
  [GameEventIdentifiers.CardUseEvent]: {
    fromId: PlayerId;
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
  [GameEventIdentifiers.DrawCardEvent]: {};
  [GameEventIdentifiers.ObtainCardEvent]: {};
  [GameEventIdentifiers.MoveCardEvent]: {};

  [GameEventIdentifiers.SkillUseEvent]: {
    fromId: PlayerId;
    cardIds?: CardId[];
    toIds?: PlayerId[];
  };
  [GameEventIdentifiers.DamageEvent]: {
    attackerId?: PlayerId;
    cardIds?: CardId[];
    damage: number;
    targetId: PlayerId;
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

  [GameEventIdentifiers.GameCreatedEvent]: {
    gameInfo: GameInfo;
  };
  [GameEventIdentifiers.GameStartEvent]: {
    currentPlayer: ClientViewPlayer;
    otherPlayers: ClientViewPlayer[];
  };
  [GameEventIdentifiers.GameOverEvent]: {
    playersInfo: ClientViewPlayer[];
  };

  [GameEventIdentifiers.PlayerEnterEvent]: {
    playerInfo: ClientViewPlayer;
  };
  [GameEventIdentifiers.PlayerLeaveEvent]: {
    playerId: PlayerId;
  };
  [GameEventIdentifiers.PlayerDiedEvent]: {
    playerInfo: ClientViewPlayer;
  };

  [GameEventIdentifiers.AskForPeachEvent]: {};
  [GameEventIdentifiers.AskForNullificationEvent]: {};
  [GameEventIdentifiers.AskForCardResponseEvent]: {};
  [GameEventIdentifiers.AskForCardUseEvent]: {};
  [GameEventIdentifiers.AskForCardDisplayEvent]: {};
  [GameEventIdentifiers.AskForCardDropEvent]: {};
}
