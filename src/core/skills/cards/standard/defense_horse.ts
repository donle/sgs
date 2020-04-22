import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'defense_horse', description: 'defense_horse_description' })
export class DefenseHorseSkill extends RulesBreakerSkill {
  public breakDefenseDistance() {
    return 1;
  }
}
