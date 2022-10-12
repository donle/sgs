import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { HanBingJianSkill } from 'core/skills/cards/standard/hanbingjian';
import { Skill } from 'core/skills/skill';
import { WeaponCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class HanBingJian extends WeaponCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'hanbingjian',
      'hanbingjian_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<Skill>('hanbingjian'),
      2,
    );
  }

  public get Skill() {
    return this.skill as HanBingJianSkill;
  }
}
