import { CompulsorySkill, DistanceSkill } from 'core/skills/skill';

@CompulsorySkill
export class ZiXinSkill extends DistanceSkill {
  constructor() {
    super('zixin', 'zixin_skill_description', -1);
  }
}
