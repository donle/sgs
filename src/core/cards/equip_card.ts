import { Card, CardType } from './card';

import { GameCardExtensions } from 'core/game/game_props';
import { RulesBreakerSkill, Skill } from 'core/skills/skill';
import { CardSuit, RealCardId } from './libs/card_props';

export abstract class EquipCard extends Card {
  protected cardType = [CardType.Equip];
  protected effectUseDistance = 0;

  constructor(subType: CardType) {
    super();
    this.cardType.push(subType);
  }

  public get BaseType() {
    return CardType.Equip;
  }

  public get EquipType() {
    return this.cardType[1];
  }
}

export abstract class WeaponCard extends EquipCard {
  protected generalName: string;
  constructor(
    protected id: RealCardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected skill: Skill,
    private attackDistance: number,
    generalName?: string,
    protected shadowSkills: Skill[] = [],
  ) {
    super(CardType.Weapon);
    this.generalName = generalName || this.name;
  }

  public get AttackDistance() {
    return this.attackDistance;
  }
}
export abstract class ArmorCard extends EquipCard {
  protected generalName: string;

  constructor(
    protected id: RealCardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected skill: Skill,
    generalName?: string,
    protected shadowSkills: Skill[] = [],
  ) {
    super(CardType.Armor);
    this.generalName = generalName || this.name;
  }
}

export abstract class PreciousCard extends EquipCard {
  protected generalName: string;

  constructor(
    protected id: RealCardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected skill: Skill,
    generalName?: string,
    protected shadowSkills: Skill[] = [],
  ) {
    super(CardType.Precious);
    this.generalName = generalName || this.name;
  }
}

export abstract class RideCard extends EquipCard {
  protected abstract skill: RulesBreakerSkill;

  public get Skill(): RulesBreakerSkill {
    return this.skill;
  }
}

export class DefenseRideCard extends RideCard {
  protected generalName: string;

  constructor(
    protected id: RealCardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected skill: RulesBreakerSkill,
    generalName?: string,
    protected shadowSkills: Skill[] = [],
  ) {
    super(CardType.DefenseRide);
    this.generalName = generalName || this.name;
  }
}

export class OffenseRideCard extends RideCard {
  protected generalName: string;

  constructor(
    protected id: RealCardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected skill: RulesBreakerSkill,
    generalName?: string,
    protected shadowSkills: Skill[] = [],
  ) {
    super(CardType.OffenseRide);
    this.generalName = generalName || this.name;
  }
}
