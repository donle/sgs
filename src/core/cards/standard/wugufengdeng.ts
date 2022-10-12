import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { WuGuFengDengSkill } from 'core/skills/cards/standard/wugufengdeng';
import { Globe } from '../card';
import type { CardSuit, RealCardId } from '../libs/card_props';
import { TrickCard } from '../trick_card';

@Globe
export class WuGuFengDeng extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'wugufengdeng',
      'wugufengdeng_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('wugufengdeng'),
    );
  }

  public get Skill() {
    return this.skill as WuGuFengDengSkill;
  }
}
