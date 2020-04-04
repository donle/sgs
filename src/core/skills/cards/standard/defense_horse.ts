import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill
export class DefenseHorseSkill extends RulesBreakerSkill {
  constructor() {
    super('defense_horse', 'defense_horse_description');
  }

  public breakDefenseDistance() {
    return 1;
  }
}
