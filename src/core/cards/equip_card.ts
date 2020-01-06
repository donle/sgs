import { Card, CardId, CardSuit, CardType, EquipCardCategory } from './card';

import { AllStage } from 'core/game/stage';
import { DistanceSkill, Skill } from 'core/skills/skill';

export abstract class EquipCard extends Card {
  protected cardType = CardType.Equip;

  constructor(private equiCardCategory: EquipCardCategory) {
    super();
  }

  public get EqupCategory() {
    return this.equiCardCategory;
  }
}

export abstract class WeaponCard extends EquipCard {
  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected skills: Skill[],
    private attackDistance: number,
  ) {
    super(EquipCardCategory.Weapon);
  }

  public get AttackDistance() {
    return this.attackDistance;
  }
}
export abstract class ArmorCard extends EquipCard {
  protected abstract triggeredStage: AllStage;

  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected skills: Skill[],
  ) {
    super(EquipCardCategory.Weapon);
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

  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected distanceSkill: DistanceSkill,
  ) {
    super(EquipCardCategory.DefenseRide);
  }
}

export class OffenseRideCard extends RideCard {
  protected skill: Skill = this.distanceSkill;

  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected distanceSkill: DistanceSkill,
  ) {
    super(EquipCardCategory.OffenseRide);
  }
}
