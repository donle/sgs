import { Skill } from 'skills/skill';

export const enum CardSuit {
  NoSuit,
  Spade,
  Heart,
  Club,
  Diamond,
}

export type CardProps = {
  id: number;
  number: number;
  suit: CardSuit;
  name: string;
  description: string;
  skills: Skill[];
};

export abstract class Card {
  protected number: number;
  protected suit: CardSuit;
  protected name: string;
  protected description: string;
  protected skills: Skill[];

  protected constructor(props: CardProps) {
    for (const [key, value] of Object.entries(props)) {
      this[key] = value;
    }
  }
}

export const enum EquipCardType {
  Weapon,
  Shield,
  DefenseRide,
  OffenseRide,
}

export type EquipCardProps = CardProps & {
  cardType: EquipCardType;
};

export abstract class EquipCard extends Card {
  private cardType: EquipCardType;

  protected constructor(props: EquipCardProps) {
    const { cardType, ...baseProps } = props;
    super(baseProps);

    this.cardType = cardType;
  }

  public get CardType() {
    return this.cardType;
  }
}
