import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions } from 'core/game/game_props';
import { CardTransformSkill, Skill } from 'core/skills/skill';
import {
  CardId,
  CardSuit,
  RealCardId,
  VirtualCardId,
  VirtualCardIdProps,
} from './libs/card_props';

export abstract class Card {
  protected abstract id: CardId;
  protected abstract cardNumber: number;
  protected abstract suit: CardSuit;
  protected abstract name: string;
  protected abstract generalName: string;
  protected abstract description: string;
  protected abstract skill: Skill;
  protected abstract cardType: CardType;

  protected abstract fromPackage: GameCardExtensions;

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

  public get Package() {
    return this.fromPackage;
  }

  public isVirtualCard() {
    return false;
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
  protected fromPackage: GameCardExtensions;

  protected id = -1;
  protected cardNumber = 0;
  protected suit = CardSuit.NoSuit;

  constructor(
    viewAsCardName: string,
    private cardIds: RealCardId[],
    skill?: Skill,
  ) {
    super();

    const viewAsCard = Sanguosha.getCardByName(viewAsCardName) as T;
    if (!viewAsCard) {
      throw new Error(`Unable to init virtual card: ${viewAsCardName}`);
    }

    this.fromPackage = viewAsCard.Package;
    this.viewAs = viewAsCard;
    this.name = this.viewAs.Name;
    this.generalName = this.viewAs.GeneralName;
    this.description = this.viewAs.Description;
    this.skill = skill ? skill : this.viewAs.Skill;
    this.cardType = this.viewAs.Type;

    if (this.cardIds.length === 1) {
      const card = Sanguosha.getCardById(this.cardIds[0]);
      this.cardNumber = card.CardNumber;
      this.suit = card.Suit;
    }
  }

  public static parseId<T extends Card>(cardId: VirtualCardId) {
    const parsedId = JSON.parse(cardId) as VirtualCardIdProps;
    const skill =
      parsedId.skillName !== undefined
        ? Sanguosha.getSkillBySkillName(parsedId.skillName)
        : undefined;
    return VirtualCard.create<T>(parsedId.name, parsedId.containedCardIds, skill);
  }

  public static create<T extends Card>(
    viewAsCardName: string,
    cardIds: RealCardId[] = [],
    skill?: Skill,
  ) {
    return new VirtualCard<T>(viewAsCardName, cardIds, skill);
  }

  public get Id() {
    const virtualCardIdJSONObject: VirtualCardIdProps = {
      name: this.name,
      skillName: this.skill.Name,
      containedCardIds: this.cardIds,
    }

    return JSON.stringify(virtualCardIdJSONObject);
  }

  public get ActualCardIds() {
    return this.cardIds;
  }

  public get Skill() {
    return this.skill;
  }

  public isVirtualCard() {
    return true;
  }
}
