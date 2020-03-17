import { Card, CardType } from 'core/cards/card';
import { Player } from 'core/player/player';
import { Skill, SkillType } from './skill';

export class UniqueSkillRule {
  private constructor() {}

  public static prohibitedBySkillRule(bySkill: Skill, toSkill: Skill) {
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

  // tslint:disable-next-line: no-empty
  public static canTriggerSkillRule(skill: Skill, owner: Player) {}
}
