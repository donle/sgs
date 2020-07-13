import { Card, CardType } from 'core/cards/card';
import { Player } from 'core/player/player';
import { WuQian } from './characters/god/wuqian';
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

  public static canTriggerCardSkillRule(bySkill: Skill, card: Card, player: Player) {
    if (player.getFlag<boolean>(WuQian.GeneralName)) {
      return !card.is(CardType.Armor);
    }
    switch (bySkill.Name) {
      case 'qinggang':
        return !card.is(CardType.Armor);
      default:
        return true;
    }
  }

  public static isProhibited(skill: Skill, owner: Player) {
    if (owner.hasSkill('chanyuan') && owner.Hp <= 1) {
      return skill.GeneralName !== 'chanyuan' && owner.hasSkill(skill.Name);
    }
    if (owner.getFlag<boolean>('tieji') || owner.getFlag<boolean>('yijue')) {
      return skill.SkillType !== SkillType.Compulsory && owner.hasSkill(skill.Name);
    }
    if (owner.getFlag<boolean>(WuQian.GeneralName)) {
      return skill.Name === 'bazhen';
    }
    return false;
  }
}
