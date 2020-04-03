import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { ZhangBaSheMaoSkill } from 'core/skills';
import { Skill } from 'core/skills/skill';
import { WeaponCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class ZhangBaSheMao extends WeaponCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'zhangbashemao',
      'zhangbashemao_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<Skill>('zhangbashemao'),
      3,
    );
  }

  public get Skill() {
    return this.skill as ZhangBaSheMaoSkill;
  }
}
