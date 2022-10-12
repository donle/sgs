import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { BaiYinShiZiSkill } from 'core/skills/cards/legion_fight/baiyinshizi';
import { ArmorCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class BaiYinShiZi extends ArmorCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'baiyinshizi',
      'baiyinshizi_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName('baiyinshizi'),
    );
  }

  public get Skill() {
    return this.skill as BaiYinShiZiSkill;
  }
}
