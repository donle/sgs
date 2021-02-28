import { BasicCard } from 'core/cards/basic_card';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { SlashSkill } from 'core/skills/cards/standard/slash';
import { Multiple } from '../card';
import type { CardSuit, RealCardId, CardValue } from '../libs/card_props';

@Multiple
export class Slash extends BasicCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      1,
      'slash',
      'slash_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('slash'),
    );

    const slashCardValue: CardValue = {
      value: 50,
      wane: 0.2,
    };

    this.CardValue = slashCardValue;
  }

  public get Skill() {
    return this.skill as SlashSkill;
  }
}
