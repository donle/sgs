import { Card } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { GlobalRulesBreakerSkill, RulesBreakerSkill } from 'core/skills/skill';
import { GameCommonRuleObject, INFINITE_TRIGGERING_TIMES } from './game_props';

export class GameCommonRules {
  // constructor() {}
  private readonly commonCardUseRules: {
    cardMatcher: CardMatcher;
    times: number;
  }[] = [
    {
      cardMatcher: new CardMatcher({ generalName: ['slash'] }),
      times: 1,
    },
    {
      cardMatcher: new CardMatcher({ name: ['alcohol'] }),
      times: 1,
    },
  ];

  private isBannedBySideRules = (player: Player, cardOrMatcher: Card | CardMatcher) => {
    if (cardOrMatcher instanceof Card) {
      if (cardOrMatcher.GeneralName === 'peach') {
        return player.Hp >= player.MaxHp;
      }
    } else {
      if (cardOrMatcher.match(new CardMatcher({ name: ['peach'] }))) {
        return player.Hp >= player.MaxHp;
      }
    }

    return false;
  };

  private userRules: {
    [K in PlayerId]: {
      cards: {
        cardMatcher: CardMatcher;
        additionalTargets: number;
        additionalUsableTimes: number;
        additionalUsableDistance: number;
      }[];
      additionalOffenseDistance: number;
      additionalDefenseDistance: number;
      additionalHold: number;
      additionalAttackDistance: number;
    };
  } = {};

  private preCheck(user: Player) {
    if (this.userRules[user.Id] === undefined) {
      this.initPlayerCommonRules(user);
    }
    if (this.userRules[user.Id].cards === undefined) {
      this.userRules[user.Id].cards = [];
    }
  }

  public availableUseTimes(card: Card) {
    for (const commonRule of this.commonCardUseRules) {
      if (commonRule.cardMatcher.match(card)) {
        return commonRule.times;
      }
    }

    return INFINITE_TRIGGERING_TIMES;
  }

  public initPlayerCommonRules(user: Player) {
    this.userRules[user.Id] = {
      cards: [],
      additionalDefenseDistance: 0,
      additionalOffenseDistance: 0,
      additionalHold: 0,
      additionalAttackDistance: 0,
    };
  }

  public checkCardUseDistance(card: Card, user: Player) {
    this.preCheck(user);
  }

  public getCardUsableTimes(room: Room, user: Player, card: Card | CardMatcher, target?: Player) {
    let availableUseTimes = INFINITE_TRIGGERING_TIMES;

    const baseRule = this.commonCardUseRules.find(rule => rule.cardMatcher.match(card));
    if (baseRule) {
      availableUseTimes = baseRule.times;
    }

    const additionalRule = this.userRules[user.Id].cards.filter(rule => rule.cardMatcher.match(card));
    if (additionalRule) {
      availableUseTimes = additionalRule.reduce((total, current) => {
        return (total += current.additionalUsableTimes);
      }, availableUseTimes);
    }
    for (const skill of user.getSkills<RulesBreakerSkill>('breaker')) {
      availableUseTimes += skill.breakCardUsableTimes(card instanceof Card ? card.Id : card, room, user);
      if (target) {
        availableUseTimes += skill.breakCardUsableTimesTo(card instanceof Card ? card.Id : card, room, user, target);
      }
    }

    return availableUseTimes;
  }

  public canUseCard(room: Room, user: Player, card: Card | CardMatcher) {
    this.preCheck(user);

    const availableUseTimes = this.getCardUsableTimes(room, user, card);
    if (this.isBannedBySideRules(user, card)) {
      return false;
    }
    return user.cardUsedTimes(card instanceof Card ? card.Id : card) < availableUseTimes;
  }

  public canUseCardTo(room: Room, user: Player, card: Card | CardMatcher, target: Player) {
    this.preCheck(user);

    const availableUseTimes = this.getCardUsableTimes(room, user, card, target);
    if (this.isBannedBySideRules(user, card)) {
      return false;
    }

    return user.cardUsedTimes(card instanceof Card ? card.Id : card) < availableUseTimes;
  }

  public addAdditionalHoldCardNumber(user: Player, addedNumber: number) {
    this.preCheck(user);
    this.userRules[user.Id].additionalHold += addedNumber;
  }

  public addAdditionalAttackRange(user: Player, addedNumber: number) {
    this.preCheck(user);
    this.userRules[user.Id].additionalAttackDistance += addedNumber;
  }

  public getBaseHoldCardNumber(room: Room, user: Player) {
    let cardHoldNumber = -1;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      const newCardHoldNumber = skill.breakBaseCardHoldNumber(room, user);
      if (newCardHoldNumber > cardHoldNumber) {
        cardHoldNumber = newCardHoldNumber;
      }
    });

    return cardHoldNumber >= 0 ? cardHoldNumber : user.Hp;
  }

  public getAdditionalHoldCardNumber(room: Room, user: Player) {
    this.preCheck(user);
    let additionalCardHold = this.userRules[user.Id].additionalHold;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      additionalCardHold += skill.breakAdditionalCardHoldNumber(room, user);
    });

    for (const owner of room.getAlivePlayersFrom()) {
      for (const skill of owner.getSkills<GlobalRulesBreakerSkill>('globalBreaker')) {
        additionalCardHold += skill.breakAdditionalCardHold(room, owner, user);
      }
    }

    return additionalCardHold;
  }

  public addCardUsableTimes(cardMatcher: CardMatcher, times: number, user: Player) {
    this.preCheck(user);
    const matchedRules = this.userRules[user.Id].cards.filter(cardProp => cardProp.cardMatcher.match(cardMatcher));
    if (matchedRules.length === 0) {
      this.userRules[user.Id].cards.push({
        cardMatcher,
        additionalTargets: 0,
        additionalUsableDistance: 0,
        additionalUsableTimes: times,
      });
    } else {
      matchedRules.map(rule => (rule.additionalUsableTimes += times));
    }
  }

  public addCardUsableDistance(cardMatcher: CardMatcher, times: number, user: Player) {
    this.preCheck(user);
    this.userRules[user.Id].cards
      .filter(cardProp => cardProp.cardMatcher.match(cardMatcher))
      .map(rule => (rule.additionalUsableDistance += times));
  }

  public addAdditionalUsableNumberOfTargets(card: Card, user: Player, additional: number) {
    this.userRules[user.Id].cards
      .filter(rule => rule.cardMatcher.match(card))
      .map(rule => (rule.additionalTargets += additional));
  }

  public addNewCardRules(
    rule: {
      cardMatcher: CardMatcher;
      additionalTargets: number;
      additionalUsableTimes: number;
      additionalUsableDistance: number;
    },
    user: Player,
  ) {
    this.preCheck(user);
    this.userRules[user.Id].cards.push(rule);
  }

  public removeCardRules(cardMatcher: CardMatcher, user: Player) {
    this.userRules[user.Id].cards = this.userRules[user.Id].cards.filter(rule => rule.cardMatcher.match(cardMatcher));
  }

  public getCardAdditionalUsableDistance(
    room: Room,
    user: Player,
    card: Card | CardMatcher | undefined,
    target?: Player,
  ) {
    this.preCheck(user);
    let times = 0;
    if (card !== undefined) {
      this.userRules[user.Id].cards
        .filter(rule => rule.cardMatcher.match(card))
        .forEach(rule => {
          times += rule.additionalUsableDistance;
        });
    }

    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      times +=
        skill.breakCardUsableDistance(card instanceof Card ? card.Id : card, room, user) +
        (target ? skill.breakCardUsableDistanceTo(card instanceof Card ? card.Id : card, room, user, target) : 0);
    });

    for (const player of room.getAlivePlayersFrom()) {
      let count = 0;
      player.getSkills<GlobalRulesBreakerSkill>('globalBreaker').forEach(skill => {
        count += skill.breakGlobalCardUsableDistance(card instanceof Card ? card.Id : card, room, player, user);
      });

      times += count;
    }

    return times;
  }
  public getCardAdditionalNumberOfTargets(room: Room, user: Player, card: Card | CardMatcher) {
    this.preCheck(user);
    let times = 0;
    this.userRules[user.Id].cards
      .filter(rule => rule.cardMatcher.match(card))
      .forEach(rule => {
        times += rule.additionalTargets;
      });

    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      times += skill.breakCardUsableTargets(card instanceof Card ? card.Id : card, room, user);
    });

    return times;
  }

  public getAdditionalAttackDistance(user: Player) {
    this.preCheck(user);
    return this.userRules[user.Id].additionalAttackDistance;
  }

  public getCardAdditionalAttackDistance(room: Room, user: Player, card?: Card | CardMatcher, target?: Player) {
    this.preCheck(user);
    let distance = this.userRules[user.Id].additionalAttackDistance;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      distance += skill.breakAttackDistance(card instanceof Card ? card.Id : card, room, user);
    });

    return distance;
  }

  public getAdditionalOffenseDistance(room: Room, user: Player) {
    this.preCheck(user);
    let distance = this.userRules[user.Id].additionalOffenseDistance;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      distance += skill.breakOffenseDistance(room, user);
    });

    return distance;
  }
  public getAdditionalDefenseDistance(room: Room, user: Player) {
    this.preCheck(user);
    let distance = this.userRules[user.Id].additionalDefenseDistance;
    user.getSkills<RulesBreakerSkill>('breaker').forEach(skill => {
      distance += skill.breakDefenseDistance(room, user);
    });

    return distance;
  }

  public toSocketObject(user: Player): GameCommonRuleObject {
    this.preCheck(user);

    const rule = this.userRules[user.Id];
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

  public syncSocketObject(user: Player, ruleObject: GameCommonRuleObject) {
    if (this.userRules[user.Id] === undefined) {
      this.initPlayerCommonRules(user);
    }

    const rule = this.userRules[user.Id];
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
