import { Card } from 'core/cards/card';
import { CardSuit } from 'core/cards/libs/card_props';
import { Precondition } from './precondition/precondition';

export const enum JudgeMatcherEnum {
  LeBuSiShu = 1,
  BingLiangCunDuan,
  BaGuaZhen,
  Lightning,
  BaoNve,
  WuHun,
  LuoShen,
  SiShu,
  TunTian,
}

export abstract class JudgeMatcher {
  public static onJudge(matcherEnum: JudgeMatcherEnum, card: Card) {
    switch (matcherEnum) {
      case JudgeMatcherEnum.LeBuSiShu:
        return this.LeBuSiShu(card);
      case JudgeMatcherEnum.BingLiangCunDuan:
        return this.BingLiangCunDuan(card);
      case JudgeMatcherEnum.BaGuaZhen:
        return this.BaGuaZhen(card);
      case JudgeMatcherEnum.Lightning:
        return this.Lightning(card);
      case JudgeMatcherEnum.BaoNve:
        return this.BaoNve(card);
      case JudgeMatcherEnum.WuHun:
        return this.WuHun(card);
      case JudgeMatcherEnum.LuoShen:
        return this.LuoShen(card);
      case JudgeMatcherEnum.SiShu:
        return this.SiShu(card);
      case JudgeMatcherEnum.TunTian:
        return this.TunTian(card);
      default:
        throw Precondition.UnreachableError(matcherEnum);
    }
  }

  private static LeBuSiShu(card: Card) {
    return card.Suit !== CardSuit.Heart;
  }

  private static SiShu(card: Card) {
    return card.Suit === CardSuit.Heart;
  }
  private static TunTian(card: Card) {
    return card.Suit !== CardSuit.Heart;
  }
  private static BingLiangCunDuan(card: Card) {
    return card.Suit !== CardSuit.Club;
  }
  private static BaGuaZhen(card: Card) {
    return card.isRed();
  }
  private static Lightning(card: Card) {
    return card.Suit === CardSuit.Spade && card.CardNumber >= 2 && card.CardNumber <= 9;
  }
  private static BaoNve(card: Card) {
    return card.Suit === CardSuit.Spade;
  }
  private static WuHun(card: Card) {
    return card.Name !== 'peach' && card.Name !== 'taoyuanjieyi';
  }
  private static LuoShen(card: Card) {
    return card.isBlack();
  }
}
