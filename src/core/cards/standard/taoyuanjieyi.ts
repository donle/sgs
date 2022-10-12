import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { TaoYuanJieYiSkill } from 'core/skills';
import { Globe } from '../card';
import type { CardSuit, RealCardId } from '../libs/card_props';
import { TrickCard } from '../trick_card';

@Globe
export class TaoYuanJieYi extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      0,
      'taoyuanjieyi',
      'taoyuanjieyi_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('taoyuanjieyi'),
    );
  }

  public get Skill() {
    return this.skill as TaoYuanJieYiSkill;
  }
}
