import { CardType } from 'core/cards/card';
import { CardSuit } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { PlayerPhase } from 'core/game/stage_processor';
import { PlayerCardsArea, PlayerRole } from 'core/player/player_props';
import { GameMode } from 'core/shares/types/room_props';
import { Precondition } from '../precondition/precondition';

export abstract class Functional {
  static getPlayerPhaseRawText(stage: PlayerPhase) {
    switch (stage) {
      case PlayerPhase.PhaseBegin:
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
      case PlayerPhase.PhaseFinish:
        return 'finish stage';
      default:
        throw Precondition.UnreachableError(stage);
    }
  }

  static getPlayerCardAreaText(area: PlayerCardsArea) {
    switch (area) {
      case PlayerCardsArea.EquipArea:
        return 'equip area';
      case PlayerCardsArea.HandArea:
        return 'hand area';
      case PlayerCardsArea.JudgeArea:
        return 'judge area';
      case PlayerCardsArea.OutsideArea:
        return 'outside area';
      default:
        throw Precondition.UnreachableError(area);
    }
  }

  static getCardSuitRawText(suit: CardSuit) {
    const cardSuitRawText = ['nosuit', 'spade', 'heart', 'club', 'diamond'];
    return cardSuitRawText[suit];
  }

  static getPlayerRoleRawText(role: PlayerRole, mode: GameMode) {
    switch (mode) {
      case GameMode.OneVersusTwo: {
        const playerRoleRawText = {
          [PlayerRole.Lord]: 'landowners',
          [PlayerRole.Rebel]: 'peasant',
        };
        return playerRoleRawText[role];
      }
      case GameMode.TwoVersusTwo: {
        const playerRoleRawText = {
          [PlayerRole.Loyalist]: 'dragon-team',
          [PlayerRole.Rebel]: 'tiger-team',
        };
        return playerRoleRawText[role];
      }
      default: {
        const playerRoleRawText = ['unknown', 'lord', 'loyalist', 'rebel', 'renegade'];
        return playerRoleRawText[role];
      }
    }
  }
  static getPlayerNationalityText(nationality: CharacterNationality) {
    const playerRoleRawText = ['wei', 'shu', 'wu', 'qun', 'god'];
    return playerRoleRawText[nationality];
  }

  static getPlayerNationalityEnum(nationality: string) {
    switch (nationality) {
      case 'wei': {
        return CharacterNationality.Wei;
      }
      case 'shu': {
        return CharacterNationality.Shu;
      }
      case 'wu': {
        return CharacterNationality.Wu;
      }
      case 'qun': {
        return CharacterNationality.Qun;
      }
      case 'god': {
        return CharacterNationality.God;
      }
      default: {
        throw new Error(`Unknown incoming nationality: ${nationality}`);
      }
    }
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
