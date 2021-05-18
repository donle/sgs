import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { DelayedTrick, TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { BingLiangCunDuanSkill } from 'core/skills';

@DelayedTrick
export class BingLiangCunDuan extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      1,
      'bingliangcunduan',
      'bingliangcunduan_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName('bingliangcunduan'),
    );
  }

  get Skill() {
    return this.skill as BingLiangCunDuanSkill;
  }
}
