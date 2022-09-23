import { Card, CardType } from 'core/cards/card';
import { CardColor, CardId, CardSuit } from 'core/cards/libs/card_props';
import { CharacterEquipSections, CharacterNationality } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
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

  static getCardSuitCharText(suit: CardSuit) {
    const cardSuitCharText = ['□', '♠', '♥', '♣', '♦'];
    return cardSuitCharText[suit];
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
    const playerRoleRawText = ['wei', 'shu', 'wu', 'qun', 'god', 'ambitioner'];
    return playerRoleRawText[nationality];
  }

  private static compareCardTypes(cardA: Card, cardB: Card) {
    if (cardB.BaseType === CardType.Equip) {
      return -1;
    } else if (cardB.BaseType === CardType.Basic) {
      return 1;
    } else {
      return cardA.BaseType === CardType.Equip ? 1 : -1;
    }
  }

  static sortCards(cardIds: CardId[]) {
    const cards = cardIds.map(id => Sanguosha.getCardById(id));
    const sortedCards: CardId[] = [];
    const basicCards: Card[] = [];
    const trickCards: Card[] = [];
    const equipCards: Card[] = [];
    for (const card of cards) {
      if (card.is(CardType.Basic)) {
        basicCards.push(card);
      } else if (card.is(CardType.Trick)) {
        trickCards.push(card);
      } else {
        equipCards.push(card);
      }
    }

    for (const tpyeCards of [basicCards, trickCards, equipCards]) {
      for (const card of tpyeCards) {
        const index = sortedCards.findIndex(id => Sanguosha.getCardById(id).Name === card.Name);
        if (index >= 0) {
          sortedCards.splice(index, 0, card.Id);
        } else {
          sortedCards.push(card.Id);
        }
      }
    }

    return sortedCards;
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
      case 'ambitioner': {
        return CharacterNationality.Ambitioner;
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
      case CardType.Shield:
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

  static getCardBaseTypeAbbrRawText(type: CardType) {
    switch (type) {
      case CardType.Basic:
        return 'abbr:basic';
      case CardType.Trick:
        return 'abbr:trick';
      case CardType.Equip:
        return 'abbr:equip';
      default:
        throw new Error(`Cannot get the abbreviated raw text of card type: ${type}`);
    }
  }

  static getCardColorRawText(color: CardColor) {
    switch (color) {
      case CardColor.Black:
        return 'black';
      case CardColor.Red:
        return 'red';
      case CardColor.None:
        return 'none_color';
      default:
        throw Precondition.UnreachableError(color);
    }
  }

  static getCardNumberRawText(cardNumber: number) {
    switch (cardNumber) {
      case 1:
        return 'A';
      case 11:
        return 'J';
      case 12:
        return 'Q';
      case 13:
        return 'K';
      default:
        return String(cardNumber);
    }
  }

  static convertEquipSectionAndCardType(
    equipSectionOrCardType: CharacterEquipSections | CardType,
  ): CardType | CharacterEquipSections {
    switch (equipSectionOrCardType) {
      case CharacterEquipSections.Weapon:
        return CardType.Weapon;
      case CharacterEquipSections.Shield:
        return CardType.Shield;
      case CharacterEquipSections.DefenseRide:
        return CardType.DefenseRide;
      case CharacterEquipSections.OffenseRide:
        return CardType.OffenseRide;
      case CharacterEquipSections.Precious:
        return CardType.Precious;
      case CardType.Weapon:
        return CharacterEquipSections.Weapon;
      case CardType.Shield:
        return CharacterEquipSections.Shield;
      case CardType.DefenseRide:
        return CharacterEquipSections.DefenseRide;
      case CardType.OffenseRide:
        return CharacterEquipSections.OffenseRide;
      case CardType.Precious:
        return CharacterEquipSections.Precious;
      default:
        throw new Error(`Cannot convert this value: ${equipSectionOrCardType}`);
    }
  }

  static convertSuitStringToSuit(suitStr: string) {
    switch (suitStr) {
      case 'spade':
        return CardSuit.Spade;
      case 'club':
        return CardSuit.Club;
      case 'diamond':
        return CardSuit.Diamond;
      case 'heart':
        return CardSuit.Heart;
      default:
        throw new Error(`Cannot convert this value: ${suitStr}`);
    }
  }
}
