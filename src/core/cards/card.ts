import { Skill } from 'core/skills/skill';
import { Sanguosha } from 'core/game/engine';

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
  private viewAs: T;
  protected name: string;
  protected description: string;
  protected skills: Skill[];
  protected cardType: CardType;

  protected id = -1;
  protected cardNumber = 0;
  protected suit = CardSuit.NoSuit;

  private constructor(viewAsCardName: string, private cards: Card[]) {
    super();

    this.viewAs = Sanguosha.getCardByName(viewAsCardName);
    this.name = this.viewAs.Name;
    this.description = this.viewAs.Description;
    this.skills = this.viewAs.SKill;
    this.cardType = this.viewAs.Type;

    if (cards.length === 1) {
      this.cardNumber = cards[0].Number;
      this.suit = cards[0].Suit;
    }
  }

  create(viewAsCardName: string, cards: Card[] = []) {
    return new VirtualCard(viewAsCardName, cards);
  }

  public get ActualCards() {
    return this.cards;
  }

  public get ActualSkill() {
    return this.viewAs.ActualSkill;
  }
}
