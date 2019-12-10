import { DistanceSkill } from 'core/skills/skill';
import { CardSuit } from '../card';
import { OffenseRideCard } from '../equip_card';

let id = 0;
export const ZiXin = new OffenseRideCard(
  id++,
  13,
  CardSuit.Diamond,
  'zixin',
  'zixin_description',
  new DistanceSkill('zixin', 'zixin_skill_description', -1),
);
