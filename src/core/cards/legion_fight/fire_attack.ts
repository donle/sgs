import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions, INFINITE_DISTANCE } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { FireAttackSkill } from 'core/skills/cards/legion_fight/fire_attack';

export class FireAttack extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      INFINITE_DISTANCE,
      'fire_attack',
      'fire_attack_description',
      GameCardExtensions.LegionFight,
      SkillLoader.getInstance().getSkillByName('fire_attack'),
    );
  }

  get Skill() {
    return this.skill as FireAttackSkill;
  }
}
