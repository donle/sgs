import { Card, CardType } from 'core/cards/card';
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
  HuJi,
  DuLie,
  QingXi,
  ZhuiLie,
  BingHuo,
  XinChiJie,
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
      case JudgeMatcherEnum.HuJi:
        return this.HuJi(card);
      case JudgeMatcherEnum.DuLie:
        return this.DuLie(card);
      case JudgeMatcherEnum.QingXi:
        return this.QingXi(card);
      case JudgeMatcherEnum.ZhuiLie:
        return this.ZhuiLie(card);
      case JudgeMatcherEnum.BingHuo:
        return this.BingHuo(card);
      case JudgeMatcherEnum.XinChiJie:
        return this.XinChiJie(card);
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
  private static HuJi(card: Card) {
    return card.isRed();
  }
  private static DuLie(card: Card) {
    return card.Suit === CardSuit.Heart;
  }
  private static QingXi(card: Card) {
    return card.isRed();
  }
  private static ZhuiLie(card: Card) {
    return card.is(CardType.Weapon) || card.is(CardType.DefenseRide) || card.is(CardType.OffenseRide);
  }
  private static BingHuo(card: Card) {
    return card.isBlack();
  }
  private static XinChiJie(card: Card) {
    return card.CardNumber > 6;
  }
}
