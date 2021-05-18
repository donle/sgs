import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions } from 'core/game/game_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Skill, ViewAsSkill } from 'core/skills/skill';
import {
  CardColor,
  CardId,
  CardSuit,
  CardTargetEnum,
  RealCardId,
  VirtualCardId,
  VirtualCardIdProps,
} from './libs/card_props';

export function None<T extends Card>(constructor: new (...args: any) => any): any {
  return (class extends constructor {
    private readonly cardTargetNumber = CardTargetEnum.None;
    private manualSetCardTargetNumber: CardTargetEnum = CardTargetEnum.None;
  } as any) as T;
}
export function Single<T extends Card>(constructor: new (...args: any) => any): any {
  return (class extends constructor {
    private readonly cardTargetNumber = CardTargetEnum.Single;
    private manualSetCardTargetNumber: CardTargetEnum = CardTargetEnum.Single;
  } as any) as T;
}
export function Multiple<T extends Card>(constructor: new (...args: any) => any): any {
  return (class extends constructor {
    private readonly cardTargetNumber = CardTargetEnum.Multiple;
    private manualSetCardTargetNumber: CardTargetEnum = CardTargetEnum.Multiple;
  } as any) as T;
}
export function Others<T extends Card>(constructor: new (...args: any) => any): any {
  return (class extends constructor {
    private readonly cardTargetNumber = CardTargetEnum.Others;
    private manualSetCardTargetNumber: CardTargetEnum = CardTargetEnum.Others;
  } as any) as T;
}
export function Globe<T extends Card>(constructor: new (...args: any) => any): any {
  return (class extends constructor {
    private readonly cardTargetNumber = CardTargetEnum.Globe;
    private manualSetCardTargetNumber: CardTargetEnum = CardTargetEnum.Globe;
  } as any) as T;
}

export abstract class Card {
  protected abstract id: RealCardId;
  protected abstract cardNumber: number;
  protected abstract suit: CardSuit;
  protected abstract name: string;
  protected abstract generalName: string;
  protected abstract description: string;
  protected abstract skill: Skill;
  protected abstract cardType: CardType[];
  protected abstract effectUseDistance: number;

  protected abstract fromPackage: GameCardExtensions;
  protected shadowSkills: Skill[] = [];

  private readonly cardTargetNumber: CardTargetEnum = CardTargetEnum.Single;
  private manualSetCardTargetNumber: CardTargetEnum = CardTargetEnum.Single;

  public get Reforgeable() {
    return false;
  }

  public static getActualCards(cards: CardId[]): CardId[] {
    let result: CardId[] = [];
    for (const card of cards) {
      if (Card.isVirtualCardId(card)) {
        result = result.concat(Card.getActualCards(Sanguosha.getCardById<VirtualCard>(card).ActualCardIds));
      } else {
        result.push(card);
      }
    }

    return result;
  }

  public get Id(): CardId {
    return this.id;
  }

  public get CardNumber() {
    return this.cardNumber;
  }

  public get Suit() {
    return this.suit;
  }

  public get Color() {
    if (this.suit === CardSuit.NoSuit) {
      return CardColor.None;
    } else if (this.suit === CardSuit.Club || this.suit === CardSuit.Spade) {
      return CardColor.Black;
    }

    return CardColor.Red;
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

  public abstract get BaseType(): CardType;

  public get Type() {
    return this.cardType;
  }

  public get Skill() {
    return this.skill;
  }

  public get ShadowSkills() {
    return this.shadowSkills;
  }

  public get EffectUseDistance() {
    return this.effectUseDistance;
  }

  public hasTransformed() {
    return this.skill instanceof ViewAsSkill;
  }

  public is(type: CardType) {
    return this.cardType.includes(type);
  }
  public isSameType(card: Card) {
    const intersectionTypes = this.cardType.filter(subType => card.Type.includes(subType));
    return intersectionTypes.length === card.Type.length || intersectionTypes.length === this.cardType.length;
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

  public get AOE(): CardTargetEnum {
    return this.manualSetCardTargetNumber;
  }

  public set AOE(targetNumber: CardTargetEnum) {
    this.manualSetCardTargetNumber = targetNumber;
  }

  public isVirtualCard() {
    return false;
  }

  public static isVirtualCardId(id: CardId) {
    return typeof id === 'string';
  }

  public equals(card: Readonly<Card>) {
    return this.cardNumber === card.CardNumber && this.suit === card.Suit && this.name === card.Name;
  }

  public reset() {
    this.manualSetCardTargetNumber = this.cardTargetNumber;
  }
}

export const enum CardType {
  Basic,
  Equip,
  Weapon,
  Armor,
  OffenseRide,
  DefenseRide,
  Precious,
  Trick,
  DelayedTrick,
}

export const enum EquipCardCategory {
  Weapon,
  Shield,
  DefenseRide,
  OffenseRide,
  Precious,
}

export class VirtualCard<T extends Card = Card> extends Card {
  private viewAs: T;
  protected name: string;
  protected generalName: string;
  protected description: string;
  protected skill: Skill;
  protected cardType: CardType[];
  protected fromPackage: GameCardExtensions;
  protected effectUseDistance: number;
  protected bySkill: string;
  protected hideActualCard = false;

  protected id = -1;
  protected cardNumber: number;
  protected suit: CardSuit;

  private viewAsBlackCard: boolean = false;
  private viewAsRedCard: boolean = false;

  private static readonly virtualIdPrefix = 'prefix';

  constructor(
    viewAsOptions: {
      cardName: string;
      cardSuit?: CardSuit;
      cardNumber?: number;
      bySkill: string;
      hideActualCard?: boolean;
    },
    private cardIds: CardId[],
    skill?: Skill,
  ) {
    super();

    const { cardName, cardNumber, cardSuit, bySkill, hideActualCard } = viewAsOptions;

    const viewAsCard = Sanguosha.getCardByName(cardName) as T;
    Precondition.assert(viewAsCard !== undefined, `Unable to init virtual card: ${cardName}`);

    this.bySkill = bySkill;
    this.fromPackage = viewAsCard.Package;
    this.viewAs = viewAsCard;
    this.cardType = viewAsCard.Type;
    this.AOE = viewAsCard.AOE;
    this.name = this.viewAs.Name;
    this.generalName = this.viewAs.GeneralName;
    this.description = this.viewAs.Description;
    this.skill = skill ? skill : this.viewAs.Skill;
    this.cardType = this.viewAs.Type;
    this.effectUseDistance = this.viewAs.EffectUseDistance;
    this.hideActualCard = !!hideActualCard;

    this.cardNumber = cardNumber!;

    if (cardSuit !== undefined) {
      this.suit = cardSuit;
      this.viewAsBlackCard = this.suit === CardSuit.Spade || this.suit === CardSuit.Club;
      this.viewAsRedCard = this.suit === CardSuit.Heart || this.suit === CardSuit.Diamond;
    } else if (this.cardIds.length === 0) {
      this.viewAsBlackCard = this.suit === CardSuit.Spade || this.suit === CardSuit.Club;
      this.viewAsRedCard = this.suit === CardSuit.Heart || this.suit === CardSuit.Diamond;
    } else if (this.cardIds.length === 1) {
      const card = Sanguosha.getCardById(this.cardIds[0]);
      this.cardNumber = card.CardNumber;
      this.suit = card.Suit;
      this.viewAsBlackCard = this.suit === CardSuit.Spade || this.suit === CardSuit.Club;
      this.viewAsRedCard = this.suit === CardSuit.Heart || this.suit === CardSuit.Diamond;
    } else {
      this.viewAsBlackCard = true;
      this.viewAsRedCard = true;
      for (const cardId of this.cardIds) {
        const cardSuit = Sanguosha.getCardById(cardId).Suit;
        this.viewAsBlackCard = this.viewAsBlackCard && (cardSuit === CardSuit.Spade || cardSuit === CardSuit.Club);
        this.viewAsRedCard = this.viewAsRedCard && (cardSuit === CardSuit.Heart || cardSuit === CardSuit.Diamond);
      }
    }
  }

  public static parseId(cardId: VirtualCardId) {
    const parsedId = JSON.parse(cardId.slice(this.virtualIdPrefix.length)) as VirtualCardIdProps;
    const skill = parsedId.skillName !== undefined ? Sanguosha.getSkillBySkillName(parsedId.skillName) : undefined;
    return VirtualCard.create(
      {
        cardName: parsedId.name,
        cardNumber: parsedId.cardNumber,
        cardSuit: parsedId.cardSuit,
        bySkill: parsedId.bySkill,
        hideActualCard: parsedId.hideActualCard,
      },
      parsedId.containedCardIds,
      skill,
    );
  }

  public static create<T extends Card>(
    viewAsOptions: {
      cardName: string;
      cardSuit?: CardSuit;
      cardNumber?: number;
      bySkill: string;
      hideActualCard?: boolean;
    },
    cardIds: CardId[] = [],
    skill?: Skill,
  ) {
    return new VirtualCard<T>(viewAsOptions, cardIds, skill);
  }

  public isBlack() {
    return this.viewAsBlackCard;
  }

  public isRed() {
    return this.viewAsRedCard;
  }

  public isActualCardHidden() {
    return this.hideActualCard;
  }

  public get Suit() {
    return this.suit === undefined ? CardSuit.NoSuit : this.suit;
  }
  public set Suit(suit: CardSuit) {
    this.suit = suit;
  }

  public get Color() {
    if (this.viewAsBlackCard) {
      return CardColor.Black;
    } else if (this.viewAsRedCard) {
      return CardColor.Red;
    }

    return CardColor.None;
  }

  public get CardNumber() {
    return this.cardNumber === undefined ? 0 : this.cardNumber;
  }

  public set CardNumber(cardNumber: number) {
    this.cardNumber = cardNumber;
  }

  public get BaseType() {
    return this.viewAs.BaseType;
  }

  public get Reforgeable() {
    return this.viewAs.Reforgeable;
  }

  public get Id(): VirtualCardId {
    const virtualCardIdJSONObject: VirtualCardIdProps = {
      cardNumber: this.cardNumber,
      cardSuit: this.suit,
      name: this.name,
      bySkill: this.bySkill,
      skillName: this.skill.Name,
      containedCardIds: this.cardIds,
      hideActualCard: this.hideActualCard,
    };

    return VirtualCard.virtualIdPrefix + JSON.stringify(virtualCardIdJSONObject);
  }

  public get GeneratedBySkill() {
    return this.bySkill;
  }

  public get ActualCardIds() {
    return this.cardIds;
  }

  public get Skill() {
    return this.skill;
  }

  public get ViewAsCard(): Readonly<T> {
    return this.viewAs;
  }

  public isVirtualCard() {
    return true;
  }

  public findByGeneratedSkill(skillName: string): boolean {
    if (this.GeneratedBySkill === skillName) {
      return true;
    }

    if (this.ActualCardIds.length > 0) {
      for (const subCardId of this.ActualCardIds) {
        const subCard = Sanguosha.getCardById(subCardId);
        if (subCard.isVirtualCard()) {
          const subVCard = subCard as VirtualCard;
          if (subVCard.findByGeneratedSkill(skillName)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
