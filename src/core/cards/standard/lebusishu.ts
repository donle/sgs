import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { DelayedTrick, TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { LeBuSiShuSkill } from 'core/skills';

@DelayedTrick
export class LeBuSiShu extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'lebusishu',
      'lebusishu_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('lebusishu'),
    );
  }

  get Skill() {
    return this.skill as LeBuSiShuSkill;
  }
}
