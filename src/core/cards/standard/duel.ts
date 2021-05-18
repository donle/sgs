import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions, INFINITE_DISTANCE } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { DuelSkill } from 'core/skills';

export class Duel extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      INFINITE_DISTANCE,
      'duel',
      'duel_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('duel'),
    );
  }

  get Skill() {
    return this.skill as DuelSkill;
  }
}
