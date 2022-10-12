import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { BaGuaZhenSkill } from 'core/skills/cards/standard/baguazhen';
import { ArmorCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class BaGuaZhen extends ArmorCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'baguazhen',
      'baguazhen_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('baguazhen'),
    );
  }

  public get Skill() {
    return this.skill as BaGuaZhenSkill;
  }
}
