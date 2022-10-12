import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { TengJiaSkill } from 'core/skills/cards/legion_fight/tengjia';
import { ArmorCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class TengJia extends ArmorCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'tengjia',
      'tengjia_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName('tengjia'),
    );
  }

  public get Skill() {
    return this.skill as TengJiaSkill;
  }
}
