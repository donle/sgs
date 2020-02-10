import { Card, CardType } from 'core/cards/card';
import { Skill, SkillType } from './skill';

export class UniqueSkillRule {
  private constructor() {}

  public static canUseSkillRule(bySkill: Skill, toSkill: Skill) {
    switch (bySkill.Name) {
      case 'tieji':
        return toSkill.SkillType === SkillType.Compulsory;
      default:
        return true;
    }
  }

  public static canTriggerCardSkillRule(bySkill: Skill, card: Card) {
    switch (bySkill.Name) {
      case 'qinggang':
        return !card.is(CardType.Armor);
      default:
        return true;
    }
  }
}
