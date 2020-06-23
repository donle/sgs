import { CardType } from 'core/cards/card';
import { CardSuit } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
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
        throw Precondition.UnreachableError(stage);
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
  static getPlayerNationalityText(nationality: CharacterNationality) {
    const playerRoleRawText = ['wei', 'shu', 'wu', 'qun', 'god'];
    return playerRoleRawText[nationality];
  }

  static getCardTypeRawText(type: CardType) {
    switch (type) {
      case CardType.Basic:
        return 'basic card';
      case CardType.Equip:
        return 'equip card';
      case CardType.Trick:
        return 'trick card';
      case CardType.DelayedTrick:
        return 'delayed trick card';
      case CardType.Armor:
        return 'armor card';
      case CardType.Weapon:
        return 'weapon card';
      case CardType.DefenseRide:
        return 'defense ride card';
      case CardType.OffenseRide:
        return 'offense ride card';
      case CardType.Precious:
        return 'precious card';
      default:
        throw Precondition.UnreachableError(type);
    }
  }
}
