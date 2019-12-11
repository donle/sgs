import { BasicCard } from '../basic_card';
import { CardSuit } from '../card';

export class Jink extends BasicCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(id, cardNumber, suit, 'jink', 'jink_description', []);
  }

  public get ActualSkill(): undefined {
    return;
  }
}
