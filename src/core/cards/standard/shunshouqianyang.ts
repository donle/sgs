import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { ShunShouQianYangSkill } from 'core/skills';

export class ShunshouQianYang extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      1,
      'shunshouqianyang',
      'shunshouqianyang_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('shunshouqianyang'),
    );
  }

  get Skill() {
    return this.skill as ShunShouQianYangSkill;
  }
}
