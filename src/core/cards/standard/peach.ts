import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { PeachSkill } from 'core/skills/cards/standard/peach';
import { BasicCard } from '../basic_card';
import { CardSuit, RealCardId } from '../libs/card_props';

export class Peach extends BasicCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'peach',
      'peach_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('peach'),
    );
  }

  public get Skill() {
    return this.skill as PeachSkill;
  }
}
