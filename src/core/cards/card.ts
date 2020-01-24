import { Sanguosha } from 'core/game/engine';
import { CardTransformSkill, Skill } from 'core/skills/skill';

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
  protected abstract generalName: string;
  protected abstract description: string;
  protected abstract skill: Skill;
  protected abstract cardType: CardType;

  public get Id() {
    return this.id;
  }

  public get CardType() {
    return this.cardType;
  }

  public get CardNumber() {
    return this.cardNumber;
  }

  public get Suit() {
    return this.suit;
  }

  public get Name() {
    return this.name;
  }

  public get GeneralName() {
    return this.generalName;
  }

  public get Description() {
    return this.description;
  }

  public get Type() {
    return this.cardType;
  }

  public get Skill() {
    return this.skill;
  }

  public hasTransformed() {
    return this.skill instanceof CardTransformSkill;
  }

  public isBlack() {
    return this.suit === CardSuit.Spade || this.suit === CardSuit.Club;
  }
  public isRed() {
    return this.suit === CardSuit.Heart || this.suit === CardSuit.Diamond;
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

export class VirtualCard<T extends Card> extends Card {
  private viewAs: T;
  protected name: string;
  protected generalName: string;
  protected description: string;
  protected skill: Skill;
  protected cardType: CardType;

  protected id = -1;
  protected cardNumber = 0;
  protected suit = CardSuit.NoSuit;

  constructor(viewAsCardName: string, private cards: Card[], skill?: Skill) {
    super();

    const viewAsCard = Sanguosha.getCardByName(viewAsCardName) as T;
    if (!viewAsCard) {
      throw new Error(`Unable to init virtual card: ${viewAsCardName}`);
    }

    this.viewAs = viewAsCard;
    this.name = this.viewAs.Name;
    this.generalName = this.viewAs.GeneralName;
    this.description = this.viewAs.Description;
    this.skill = skill ? skill : this.viewAs.Skill;
    this.cardType = this.viewAs.Type;

    if (cards.length === 1) {
      this.cardNumber = cards[0].CardNumber;
      this.suit = cards[0].Suit;
    }
  }

  public static create<T extends Card>(
    viewAsCardName: string,
    cards: Card[] = [],
    skill?: Skill,
  ) {
    return new VirtualCard<T>(viewAsCardName, cards, skill);
  }

  public get ActualCards() {
    return this.cards;
  }

  public get Skill() {
    return this.skill;
  }
}
