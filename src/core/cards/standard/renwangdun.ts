import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { RenWangDunSkill } from 'core/skills/cards/standard/renwangdun';
import { ArmorCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';

export class RenWangDun extends ArmorCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'renwangdun',
      'renwangdun_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('renwangdun'),
    );
  }

  public get Skill() {
    return this.skill as RenWangDunSkill;
  }
}
