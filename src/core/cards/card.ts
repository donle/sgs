import { Skill } from 'core/skills/skill';

export const enum CardSuit {
  NoSuit,
  Spade,
  Heart,
  Club,
  Diamond,
}

export type CardId = number;
export type CardProps = {
  number: number;
  suit: CardSuit;
  name: string;
  description: string;
  skills: Skill[];
};

export abstract class Card {
  protected abstract id: CardId;
  protected abstract cardNumber: number;
  protected abstract suit: CardSuit;
  protected abstract name: string;
  protected abstract description: string;
  protected abstract skills: Skill[];
  protected abstract cardType: CardType;

  public get Id() {
    return this.id;
  }

  public get CardType() {
    return this.cardType;
  }
}

export const enum CardType {
  Basic,
  Equip,
  Trick,
}

export const enum EquipCardCategory {
  Weapon,
  Shield,
  DefenseRide,
  OffenseRide,
}

export class EquipCard extends Card {
  protected cardType = CardType.Basic;

  constructor(
    protected id: CardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected name: string,
    protected description: string,
    protected skills: Skill[],
    private equiCardCategory: EquipCardCategory,
  ) {
    super();
  }

  public get EqupCategory() {
    return this.equiCardCategory;
  }
}
