import { Card, CardType } from 'core/cards/card';
import { Player } from 'core/player/player';
import { QingGangSkill } from './cards/standard/qinggang';
import { XianZhenNullify } from './characters/yijiang2011/xianzhen';
import { Skill, SkillType } from './skill';

export class UniqueSkillRule {
  private constructor() {}

  public static isProhibitedBySkillRule(bySkill: Skill, toSkill: Skill) {
    switch (bySkill.Name) {
      case QingGangSkill.Name:
      case XianZhenNullify.Name:
        return toSkill.Name === 'bazhen';
      default:
        return false;
    }
  }

  public static canTriggerCardSkillRule(bySkill: Skill, card: Card) {
    switch (bySkill.Name) {
      case QingGangSkill.Name:
      case XianZhenNullify.Name:
        return !card.is(CardType.Armor);
      default:
        return true;
    }
  }

  public static isProhibited(skill: Skill, owner: Player, cardContainer?: Card) {
    if (skill.isPersistentSkill()) {
      return false;
    }

    if (cardContainer) {
      if (owner.getFlag<boolean>('wuqian')) {
        return cardContainer.is(CardType.Armor);
      }
    }

    if (owner.hasSkill('chanyuan') && owner.Hp <= 1) {
      return skill.GeneralName !== 'chanyuan' && owner.hasSkill(skill.Name);
    }
    if (owner.getFlag<boolean>('tieji') || owner.getFlag<boolean>('yijue')) {
      return skill.SkillType !== SkillType.Compulsory && owner.hasSkill(skill.Name);
    }
    if (owner.getFlag<boolean>('wuqian')) {
      return skill.Name === 'bazhen';
    }

    return false;
  }
}
