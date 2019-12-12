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

  public get Number() {
    return this.Number;
  }

  public get Suit() {
    return this.suit;
  }

  public get Name() {
    return this.Name;
  }

  public get Description() {
    return this.description;
  }

  public get Type() {
    return this.cardType;
  }

  public get SKill() {
    return this.skills;
  }

  public abstract get ActualSkill(): Skill | undefined;
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

export class VirtualCard<T extends Card> extends Card {
  protected id = -1;
  protected cardNumber = 0;
  protected suit = CardSuit.NoSuit;
  protected name = this.viewAs.Name;
  protected description = this.viewAs.Description;
  protected skills = this.viewAs.SKill;
  protected cardType = this.viewAs.Type;

  constructor(private viewAs: T, private cards: Card[] = []) {
    super();

    if (cards.length === 1) {
      this.cardNumber = cards[0].Number;
      this.suit = cards[0].Suit;
    }
  }

  public get ActualCards() {
    return this.cards;
  }

  public get ActualSkill() {
    return this.viewAs.ActualSkill;
  }
}
