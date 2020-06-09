import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions, INFINITE_DISTANCE } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { HuoGongSkill } from 'core/skills/cards/legion_fight/huogong';

export class HuoGong extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      INFINITE_DISTANCE,
      'huogong',
      'huogong_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName('huogong'),
    );
  }

  get Skill() {
    return this.skill as HuoGongSkill;
  }
}
