import { GameCardExtensions } from 'core/game/game_props';
import { CardSkill } from 'core/skills/skill';
import { Card, CardType } from './card';
import { CardSuit, RealCardId } from './libs/card_props';

export abstract class BasicCard extends Card {
  protected cardType = CardType.Basic;
  protected generalName: string;

  constructor(
    protected id: RealCardId,
    protected cardNumber: number,
    protected suit: CardSuit,
    protected effectUseDistance: number,
    protected name: string,
    protected description: string,
    protected fromPackage: GameCardExtensions,
    protected skill: CardSkill,
    generalName?: string,
  ) {
    super();
    this.generalName = generalName || this.name;
  }
}
