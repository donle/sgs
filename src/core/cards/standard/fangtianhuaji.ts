import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Skill } from 'core/skills/skill';
import { WeaponCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class FangTianHuaJi extends WeaponCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'fangtianhuaji',
      'fangtianhuaji_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<Skill>('fangtianhuaji'),
      4,
    );
  }
}
