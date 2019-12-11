import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { DistanceSkill } from 'core/skills/skill';
import { CardSuit } from '../card';
import { OffenseRideCard } from '../equip_card';

export class ZiXin extends OffenseRideCard {
  constructor(id: number, cardNumber: number, suit: CardSuit) {
    super(
      id,
      cardNumber,
      suit,
      'zixin',
      'zixin_description',
      SkillLoader.getInstance().getSkillByName<DistanceSkill>('zixin'),
    );
  }
}
