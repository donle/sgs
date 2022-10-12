import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { WuXieKeJiSkill } from 'core/skills';
import { None } from '../card';

@None
export class WuXieKeJi extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'wuxiekeji',
      'wuxiekeji_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('wuxiekeji'),
    );
  }

  get Skill() {
    return this.skill as WuXieKeJiSkill;
  }
}
