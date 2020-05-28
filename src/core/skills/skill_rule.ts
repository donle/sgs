import { Card, CardType } from 'core/cards/card';
import { Player } from 'core/player/player';
import { Skill, SkillType } from './skill';

export class UniqueSkillRule {
  private constructor() {}

  public static isProhibitedBySkillRule(bySkill: Skill, toSkill: Skill) {
    switch (bySkill.Name) {
      case 'qinggang':
        return toSkill.Name === 'bazhen';
      default:
        return false;
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

  public static isProhibited(skill: Skill, owner: Player) {
    if (owner.hasSkill('chanyuan') && owner.Hp === 1) {
      return skill.GeneralName !== 'chanyuan';
    }
    if (owner.getFlag<boolean>('tieji') || owner.getFlag<boolean>('yijue')) {
      return skill.SkillType !== SkillType.Compulsory && owner.hasSkill(skill.Name);
    }

    return false;
  }
}
