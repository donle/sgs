import { Sanguosha } from 'core/game/engine';
import { GameCardExtensions } from 'core/game/game_props';
import { BasicCard } from '../basic_card';
import { CardSuit } from '../libs/card_props';

export class Jink extends BasicCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'jink',
      'jink_description',
      GameCardExtensions.Standard,
      Sanguosha.getSkillBySkillName('jink'),
    );
  }
}
