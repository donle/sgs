import { CardSuit } from 'core/cards/libs/card_props';
import { PlayerPhase } from 'core/game/stage_processor';
import { PlayerRole } from 'core/player/player_props';
import { Precondition } from '../precondition/precondition';

export abstract class Functional {
  static getPlayerPhaseRarText(stage: PlayerPhase) {
    switch (stage) {
      case PlayerPhase.PrepareStage:
        return 'prepare stage';
      case PlayerPhase.JudgeStage:
        return 'judge stage';
      case PlayerPhase.DrawCardStage:
        return 'draw stage';
      case PlayerPhase.PlayCardStage:
        return 'play stage';
      case PlayerPhase.DropCardStage:
        return 'drop stage';
      case PlayerPhase.FinishStage:
        return 'finish stage';
      default:
        Precondition.UnreachableError(stage);
    }
  }

  static getCardSuitRawText(suit: CardSuit) {
    const cardSuitRawText = ['nosuit', 'spade', 'heart', 'club', 'diamond'];
    return cardSuitRawText[suit];
  }

  static getPlayerRoleRawText(role: PlayerRole) {
    const playerRoleRawText = ['unknown', 'lord', 'loyalist', 'rebel', 'renegade'];
    return playerRoleRawText[role];
  }
}
