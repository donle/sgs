import { DelayedTrick, TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { CardSuit, RealCardId } from '../libs/card_props';

@DelayedTrick
export class Lightning extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'lightning',
      'lightning_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('lightning'),
    );
  }

  // tslint:disable-next-line: no-empty
  public afterCardUsed() {}
}
