import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from './precondition/precondition';

export namespace System {
  export const enum AskForChoosingCardEventFilter {
    SheLie,
    PoXi,
    JieYue,
    ChengXiang,
  }

  const differentCardSuitFilterFunction = (allCards: CardId[], selected: CardId[], currentCard: CardId) => {
    const card = Sanguosha.getCardById(currentCard);
    return (
      selected.includes(currentCard) ||
      selected.find(cardId => Sanguosha.getCardById(cardId).Suit === card.Suit) === undefined
    );
  };

  const differentCardAreaFilterFunction = (
    allCards: CardId[],
    selected: CardId[],
    currentCard: CardId,
    involvedTargets?: Player[],
  ) => {
    const from = Precondition.exists(involvedTargets, 'unknown involvedTargets')[0];
    const currentArea = from.cardFrom(currentCard);

    return (
      selected.includes(currentCard) || selected.find(cardId => from.cardFrom(cardId) === currentArea) === undefined
    );
  };

  const thirteenPointFilterFunction = (allCards: CardId[], selected: CardId[], currentCard: CardId) => {
    if (selected.includes(currentCard)) {
      return true;
    }
    const totalPoint: number = selected.reduce<number>((total, card) => {
      return total + Sanguosha.getCardById(card).CardNumber;
    }, 0);
    const card = Sanguosha.getCardById(currentCard);
    return totalPoint + card.CardNumber <= 13;
  };

  export type AskForChoosingCardEventFilterFunc = (
    allCards: CardId[],
    selected: CardId[],
    currentCard: CardId,
    involvedTargets?: Player[],
  ) => boolean;

  export const AskForChoosingCardEventFilters: {
    [K in AskForChoosingCardEventFilter]: AskForChoosingCardEventFilterFunc;
  } = {
    [AskForChoosingCardEventFilter.PoXi]: differentCardSuitFilterFunction,
    [AskForChoosingCardEventFilter.SheLie]: differentCardSuitFilterFunction,
    [AskForChoosingCardEventFilter.JieYue]: differentCardAreaFilterFunction,
    [AskForChoosingCardEventFilter.ChengXiang]: thirteenPointFilterFunction,
  };

  export type SideEffectSkillApplierFunc = (player: Player, room: Room) => boolean;

  export const enum SideEffectSkillApplierEnum {
    ZhiBa,
    HuangTian,
  }

  export const SideEffectSkillAppliers: { [K in SideEffectSkillApplierEnum]: SideEffectSkillApplierFunc } = {
    [SideEffectSkillApplierEnum.ZhiBa]: (player: Player, room: Room) => {
      return player.Nationality === CharacterNationality.Wu && player.Role !== PlayerRole.Lord;
    },
    [SideEffectSkillApplierEnum.HuangTian]: (player: Player, room: Room) => {
      return player.Nationality === CharacterNationality.Qun && player.Role !== PlayerRole.Lord;
    },
  };
}
