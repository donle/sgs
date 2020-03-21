import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill
export class OffenseHorseSkill extends RulesBreakerSkill {
  constructor() {
    super('offense_horse', 'offense_horse_description');
  }

  public breakOffenseDistance() {
    return 1;
  }
}
