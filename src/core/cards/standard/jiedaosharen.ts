import { CardSuit } from 'core/cards/libs/card_props';
import type { RealCardId } from 'core/cards/libs/card_props';
import { TrickCard } from 'core/cards/trick_card';
import { GameCardExtensions, INFINITE_DISTANCE } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { JieDaoShaRenSkill } from 'core/skills';
import { Single } from '../card';

@Single
export class JieDaoShaRen extends TrickCard {
  constructor(id: RealCardId, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      INFINITE_DISTANCE,
      'jiedaosharen',
      'jiedaosharen_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName('jiedaosharen'),
    );
  }

  get Skill() {
    return this.skill as JieDaoShaRenSkill;
  }
}
