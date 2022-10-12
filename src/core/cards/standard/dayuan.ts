import { OffenseRideCard } from '../equip_card';
import { CardSuit } from '../libs/card_props';
import { GameCardExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { RulesBreakerSkill } from 'core/skills/skill';

export class DaYuan extends OffenseRideCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'dayuan',
      'dayuan_description',
      GameCardExtensions.Standard,
      SkillLoader.getInstance().getSkillByName<RulesBreakerSkill>('offense_horse'),
    );
  }
}
