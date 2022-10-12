import { DuJiang, SheQue, YangWei } from '.';
import { QingGangSkill } from './cards/standard/qinggang';
import { XianZhenNullify } from './characters/yijiang2011/xianzhen';
import { BenXi } from './characters/yijiang2014/benxi';
import { Skill, SkillProhibitedSkill } from './skill';
import { Card, CardType } from 'core/cards/card';
import { Player } from 'core/player/player';

export class UniqueSkillRule {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static isProhibitedBySkillRule(bySkill: Skill, toSkill: Skill) {
    switch (bySkill.Name) {
      case QingGangSkill.Name:
      case XianZhenNullify.Name:
      case BenXi.Name:
      case SheQue.Name:
        return toSkill.Name === 'bazhen' || toSkill.Name === 'linglong';
      default:
        return false;
    }
  }

  public static canTriggerCardSkillRule(bySkill: Skill, card: Card) {
    switch (bySkill.Name) {
      case QingGangSkill.Name:
      case XianZhenNullify.Name:
      case BenXi.Name:
      case SheQue.Name:
      case YangWei.Name:
      case DuJiang.Name:
        return !card.is(CardType.Shield);
      default:
        return true;
    }
  }

  public static isProhibited(skill: Skill, owner: Player, cardContainer?: Card, except: Skill[] = []) {
    if (skill.isPersistentSkill()) {
      return false;
    }

    if (cardContainer) {
      if (owner.getFlag<boolean>('wuqian')) {
        return cardContainer.is(CardType.Shield);
      }
    }

    for (const pSkill of owner.getSkillProhibitedSkills()) {
      if (except.includes(pSkill)) {
        continue;
      }

      const copyList: Skill[] = [];
      copyList.push(...except, pSkill);
      if (
        !this.isProhibited(pSkill, owner, cardContainer, copyList) &&
        (pSkill as SkillProhibitedSkill).skillFilter(skill, owner, cardContainer)
      ) {
        return true;
      }
    }

    if (owner.getFlag<boolean>('wuqian')) {
      return skill.Name === 'bazhen' || skill.Name === 'linglong';
    }

    return false;
  }
}
