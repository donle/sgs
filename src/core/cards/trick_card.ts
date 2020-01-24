import { Card, CardType } from './card';

export abstract class TrickCard extends Card {
  protected cardType = CardType.Trick;
}

export abstract class DelayedTrickCard extends TrickCard {}
