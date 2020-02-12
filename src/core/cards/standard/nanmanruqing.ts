import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { NanManRuQingSkill } from 'core/skills/cards/standard/nanmanruqing';
import { CardSuit, RealCardId } from '../libs/card_props';
import { TrickCard } from '../trick_card';

export class NanManRuQing extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'nanmanruqing',
      'nanmanruqing_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('nanmanruqing'),
    );
  }

  public get Skill() {
    return this.skill as NanManRuQingSkill;
  }
}
