import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { GuanShiFuSkill } from 'core/skills';
import { Skill } from 'core/skills/skill';
import { WeaponCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class GuanShiFu extends WeaponCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'guanshifu',
      'guanshifu_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<Skill>('guanshifu'),
      3,
    );
  }

  public get Skill() {
    return this.skill as GuanShiFuSkill;
  }
}
