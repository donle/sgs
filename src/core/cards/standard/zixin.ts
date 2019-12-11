import { DistanceSkill } from 'core/skills/skill';
import { CardSuit } from '../card';
import { OffenseRideCard } from '../equip_card';

export class ZiXin extends OffenseRideCard {
  constructor(id: number) {
    super(
      id,
      13,
      CardSuit.Diamond,
      'zixin',
      'zixin_description',
      new DistanceSkill('zixin', 'zixin_skill_description', -1),
    );
  }
}
