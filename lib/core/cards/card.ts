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
  protected number: number;
  protected suit: CardSuit;
  protected name: string;
  protected description: string;
  protected skills: Skill[];

  protected constructor(private id: CardId, props: CardProps) {
    for (const [key, value] of Object.entries(props)) {
      this[key] = value;
    }
  }

  public get Id() {
    return this.id;
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

  protected constructor(id: CardId, props: EquipCardProps) {
    const { cardType, ...baseProps } = props;
    super(id, baseProps);

    this.cardType = cardType;
  }

  public get CardType() {
    return this.cardType;
  }
}
