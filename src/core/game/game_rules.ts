import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { RulesBreakerSkill } from 'core/skills/skill';
import { GameCommonRuleObject, INFINITE_TRIGGERING_TIMES } from './game_props';

export class GameCommonRules {
  private constructor() {}
  private static readonly commonCardUseRules: {
    cardMatcher: CardMatcher;
    times: number;
  }[] = [
    {
      cardMatcher: new CardMatcher({ name: ['slash'] }),
      times: 1,
    },
    {
      cardMatcher: new CardMatcher({ name: ['alcohol'] }),
      times: 1,
    },
    {
      cardMatcher: new CardMatcher({ name: ['jink'] }),
      times: 0,
    },
  ];

  private static userRules: {
    [K in PlayerId]: {
      cards: {
        cardMatcher: CardMatcher;
        additionalTargets: number;
        additionalUsableTimes: number;
        additionalUsableDistance: number;
      }[];
      additionalOffenseDistance: number;
      additionalDefenseDistance: number;
      additionalHold: number; // server only
      additionalAttackDistance: number;
    };
  } = {};

  private static preCheck(user: Player) {
    if (GameCommonRules.userRules[user.Id] === undefined) {
      this.initPlayerCommonRules(user);
    }
  }

  public static availableUseTimes(card: Card) {
    for (const commonRule of GameCommonRules.commonCardUseRules) {
      if (commonRule.cardMatcher.match(card)) {
        return commonRule.times;
      }
    }

    return INFINITE_TRIGGERING_TIMES;
  }

  public static initPlayerCommonRules(user: Player) {
    GameCommonRules.userRules[user.Id] = {
      cards: [],
      additionalDefenseDistance: 0,
      additionalOffenseDistance: 0,
      additionalHold: 0,
      additionalAttackDistance: 0,
    };
  }

  public static checkCardUseDistance(card: Card, user: Player) {
    GameCommonRules.preCheck(user);
  }

  public static canUse(user: Player, card: Card | CardMatcher) {
    GameCommonRules.preCheck(user);

    let availableUseTimes = INFINITE_TRIGGERING_TIMES;

    const baseRule = GameCommonRules.commonCardUseRules.find(rule =>
      rule.cardMatcher.match(card),
    );
    if (baseRule) {
      availableUseTimes = baseRule.times;
    }

    const additionalRule = GameCommonRules.userRules[user.Id].cards.find(rule =>
      rule.cardMatcher.match(card),
    );
    if (additionalRule) {
      availableUseTimes += additionalRule.additionalUsableTimes;
    }
    if (card instanceof Card) {
      for (const skill of user.getSkills<RulesBreakerSkill>('breaker')) {
        availableUseTimes += skill.breakCardUsableTimes(card.Id);
      }
    }

    return (
      user.cardUsedTimes(card instanceof Card ? card.Id : card) <
      availableUseTimes
    );
  }

  public static addAdditionalHoldCardNumber(user: Player, addedNumber: number) {
    GameCommonRules.preCheck(user);

    this.userRules[user.Id].additionalHold += addedNumber;
  }
  public static getAdditionalHoldCardNumber(user: Player) {
    GameCommonRules.preCheck(user);

    return this.userRules[user.Id].additionalHold;
  }

  public static addCardUsableTimes(
    cardMatcher: CardMatcher,
    times: number,
    user: Player,
  ) {
    GameCommonRules.preCheck(user);
    this.userRules[user.Id].cards
      .filter(cardProp => cardProp.cardMatcher.match(cardMatcher))
      .map(rule => (rule.additionalUsableTimes += times));
  }

  public static addCardUsableDistance(
    cardMatcher: CardMatcher,
    times: number,
    user: Player,
  ) {
    GameCommonRules.preCheck(user);
    this.userRules[user.Id].cards
      .filter(cardProp => cardProp.cardMatcher.match(cardMatcher))
      .map(rule => (rule.additionalUsableDistance += times));
  }

  public static addAdditionalUsableNumberOfTargets(
    card: Card,
    user: Player,
    additional: number,
  ) {
    this.userRules[user.Id].cards
      .filter(rule => rule.cardMatcher.match(card))
      .map(rule => (rule.additionalTargets += additional));
  }

  public static addNewCardRules(
    rule: {
      cardMatcher: CardMatcher;
      additionalTargets: number;
      additionalUsableTimes: number;
      additionalUsableDistance: number;
    },
    user: Player,
  ) {
    GameCommonRules.userRules[user.Id].cards.push(rule);
  }

  public static removeCardRules(cardMatcher: CardMatcher, user: Player) {
    GameCommonRules.userRules[user.Id].cards = GameCommonRules.userRules[
      user.Id
    ].cards.filter(rule => rule.cardMatcher.match(cardMatcher));
  }

  public static getCardAdditionalUsableTimes(
    card: Card | CardMatcher,
    user: Player,
  ) {
    let times = 0;
    GameCommonRules.userRules[user.Id].cards
      .filter(rule => rule.cardMatcher.match(card))
      .forEach(rule => {
        times += rule.additionalUsableTimes;
      });

    if (card instanceof Card) {
      user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
        times += skill.breakCardUsableTimes(card.Id);
      });
    }

    return times;
  }
  public static getCardAdditionalUsableDistance(
    card: Card | CardMatcher,
    user: Player,
  ) {
    let times = 0;
    GameCommonRules.userRules[user.Id].cards
      .filter(rule => rule.cardMatcher.match(card))
      .forEach(rule => {
        times += rule.additionalUsableDistance;
      });

    if (card instanceof Card) {
      user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
        times += skill.breakCardUsableDistance(card.Id);
      });
    }

    return times;
  }
  public static getCardAdditionalNumberOfTargets(
    card: Card | CardMatcher,
    user: Player,
  ) {
    let times = 0;
    GameCommonRules.userRules[user.Id].cards
      .filter(rule => rule.cardMatcher.match(card))
      .forEach(rule => {
        times += rule.additionalTargets;
      });

    if (card instanceof Card) {
      user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
        times += skill.breakCardUsableTargets(card.Id);
      });
    }

    return times;
  }

  public static getAdditionalAttackDistance(user: Player) {
    GameCommonRules.preCheck(user);
    return GameCommonRules.userRules[user.Id].additionalAttackDistance;
  }

  public static getCardAdditionalAttackDistance(card: Card, user: Player) {
    GameCommonRules.preCheck(user);
    let distance = GameCommonRules.userRules[user.Id].additionalAttackDistance;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      distance += skill.breakAttackDistance(card.Id);
    });

    return distance;
  }

  public static getAdditionalOffenseDistance(user: Player) {
    GameCommonRules.preCheck(user);
    let distance = GameCommonRules.userRules[user.Id].additionalOffenseDistance;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      distance += skill.breakOffenseDistance();
    });

    return distance;
  }
  public static getAdditionalDefenseDistance(user: Player) {
    GameCommonRules.preCheck(user);
    let distance = GameCommonRules.userRules[user.Id].additionalDefenseDistance;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      distance += skill.breakOffenseDistance();
    });

    return distance;
  }

  public static toSocketObject(user: Player): GameCommonRuleObject {
    GameCommonRules.preCheck(user);

    const rule = GameCommonRules.userRules[user.Id];
    const cardRules = rule.cards.map(cardRule => {
      return {
        ...cardRule,
        cardMatcher: cardRule.cardMatcher.toSocketPassenger(),
      };
    });

    return {
      ...rule,
      cards: cardRules,
    };
  }

  public static syncSocketObject(
    user: Player,
    ruleObject: GameCommonRuleObject,
  ) {
    if (GameCommonRules.userRules[user.Id] === undefined) {
      GameCommonRules.initPlayerCommonRules(user);
    }

    const rule = GameCommonRules.userRules[user.Id];
    rule.additionalAttackDistance = ruleObject.additionalAttackDistance;
    rule.additionalDefenseDistance = ruleObject.additionalDefenseDistance;
    rule.additionalHold = ruleObject.additionalHold;
    rule.additionalOffenseDistance = ruleObject.additionalOffenseDistance;

    rule.cards = ruleObject.cards.map(cardRule => {
      return {
        ...cardRule,
        cardMatcher: new CardMatcher(cardRule.cardMatcher),
      };
    });
  }
}
