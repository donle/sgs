import { Card, CardType } from 'core/cards/card';
import { Player } from 'core/player/player';
import { Skill, SkillType } from './skill';

export class UniqueSkillRule {
  private constructor() {}

  public static prohibitedBySkillRule(bySkill: Skill, toSkill: Skill) {
    switch (bySkill.Name) {
      case 'qinggang':
        return toSkill.Name !== 'bazhen';
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

  public static canTriggerSkillRule(skill: Skill, owner: Player) {
    if (owner.getFlag<boolean>('jieji')) {
      return skill.SkillType === SkillType.Compulsory;
    }

    return true;
  }
}
