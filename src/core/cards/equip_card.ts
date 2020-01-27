import { Card, CardId, CardSuit, CardType, EquipCardCategory } from './card';

import { GameCardExtensions } from 'core/game/game_props';
import { AllStage } from 'core/game/stage';
import { DistanceSkill, Skill } from 'core/skills/skill';

export abstract class EquipCard extends Card {
  protected cardType = CardType.Equip;

  constructor(private equiCardCategory: EquipCardCategory) {
    super();
  }

  public get EquipCategory() {
    return this.equiCardCategory;
  }
}

export abstract class WeaponCard extends EquipCard {
  protected generalName: string;
  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected skills: Skill[],
    private attackDistance: number,
    generalName?: string,
  ) {
    super(EquipCardCategory.Weapon);
    this.generalName = generalName || this.name;
  }

  public get AttackDistance() {
    return this.attackDistance;
  }
}
export abstract class ArmorCard extends EquipCard {
  protected abstract triggeredStage: AllStage;
  protected generalName: string;

  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected skills: Skill[],
    generalName?: string,
  ) {
    super(EquipCardCategory.Weapon);
    this.generalName = generalName || this.name;
  }
}

export abstract class RideCard extends EquipCard {
  protected abstract distanceSkill: DistanceSkill;

  public get Skill(): DistanceSkill {
    return this.distanceSkill;
  }

  public get Distance() {
    return this.distanceSkill.Distance;
  }
}

export class DefenseRideCard extends RideCard {
  protected skill: Skill = this.distanceSkill;
  protected generalName: string;

  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected distanceSkill: DistanceSkill,
    generalName?: string,
  ) {
    super(EquipCardCategory.DefenseRide);
    this.generalName = generalName || this.name;
  }
}

export class OffenseRideCard extends RideCard {
  protected skill: Skill = this.distanceSkill;
  protected generalName: string;

  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected distanceSkill: DistanceSkill,
    generalName?: string,
  ) {
    super(EquipCardCategory.OffenseRide);
    this.generalName = generalName || this.name;
  }
}
