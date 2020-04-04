import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Skill } from 'core/skills/skill';
import { WeaponCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class QiLinGong extends WeaponCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'qilingong',
      'qilingong_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<Skill>('qilingong'),
      5,
    );
  }
}
