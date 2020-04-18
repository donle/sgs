import { GameCardExtensions } from 'core/game/game_props';
import { Skill } from 'core/skills/skill';
import { Card, CardType } from './card';
import { CardSuit, RealCardId } from './libs/card_props';

export function DelayedTrick<T extends TrickCard>(
  constructor: new (
    id: RealCardId,
    cardNumber: number,
    suit: CardSuit,
    effectUseDistance: number,
    name: string,
    description: string,
    fromPackage: GameCardExtensions,
    skill: Skill,
    generalName?: string,
  ) => any,
): any {
  return (class extends constructor {
    protected cardType: CardType[];
    constructor(
      id: RealCardId,
      cardNumber: number,
      suit: CardSuit,
      effectUseDistance: number,
      name: string,
      description: string,
      fromPackage: GameCardExtensions,
      skill: Skill,
      generalName?: string,
    ) {
      super(id, cardNumber, suit, effectUseDistance, name, description, fromPackage, skill, generalName);

      this.cardType.push(CardType.DelayedTrick);
    }
  } as any) as T;
}

export abstract class TrickCard extends Card {
  protected cardType = [CardType.Trick];
  protected generalName: string;

  constructor(
    protected id: RealCardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected effectUseDistance: number,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected skill: Skill,
    generalName?: string,
  ) {
    super();
    this.generalName = generalName || this.name;
  }

  public get BaseType() {
    return CardType.Trick;
  }

  public isDelayedTrick() {
    return this.cardType.includes(CardType.DelayedTrick);
  }
}
