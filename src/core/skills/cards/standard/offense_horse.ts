import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill
export class OffenseHorseSkill extends RulesBreakerSkill {
  constructor(name = 'offense_horse', description = 'offense_horse_description') {
    super(name, description);
  }

  public breakOffenseDistance() {
    return 1;
  }
}
