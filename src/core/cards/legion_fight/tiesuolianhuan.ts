import { GameCardExtensions, INFINITE_DISTANCE } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Multiple } from '../card';
import type { CardSuit, RealCardId } from '../libs/card_props';
import { TrickCard } from '../trick_card';

@Multiple
export class TieSuoLianHuan extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      INFINITE_DISTANCE,
      'tiesuolianhuan',
      'tiesuolianhuan_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName('tiesuolianhuan'),
    );
  }

  get Reforgeable() {
    return true;
  }

  get Skill() {
    return this.skill;
  }
}
