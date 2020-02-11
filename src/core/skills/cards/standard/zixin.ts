import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill
export class ZiXinSkill extends RulesBreakerSkill {
  constructor() {
    super('zixin', 'zixin_description');
  }

  public breakOffenseDistance() {
    return 1;
  }
}
