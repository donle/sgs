import { JinkSkill } from 'core/skills/cards/standard/jink';
import { NanManRuQingSkill } from 'core/skills/cards/standard/nanmanruqing';
import { PeachSkill } from 'core/skills/cards/standard/peach';
import { SlashSkill } from 'core/skills/cards/standard/slash';
import { WanJianQiFaSkill } from 'core/skills/cards/standard/wanjianqifa';
import { ZiXinSkill } from 'core/skills/cards/standard/zixin';
import { HujiaSkill } from 'core/skills/characters/standard/hujia';
import { JianXiongSkill } from 'core/skills/characters/standard/jianxiong';
import {
  JiJiangShadowSkill,
  JiJiangSkill,
} from 'core/skills/characters/standard/jijiang';
import { JiuYuan } from 'core/skills/characters/standard/jiuyuan';
import { JiZhiSkill } from 'core/skills/characters/standard/jizhi';
import { QiCaiSkill } from 'core/skills/characters/standard/qicai';
import { QingGangSkill } from 'core/skills/characters/standard/qinggang';
import { RendeSkill } from 'core/skills/characters/standard/rende';
import { ZhiHeng } from 'core/skills/characters/standard/zhiheng';
import { ZhuGeLianNuSlashSkill } from 'core/skills/characters/standard/zhugeliannu_slash';
import { Skill } from 'core/skills/skill';

const allSkills = [
  new SlashSkill(),
  new ZhiHeng(),
  new JiuYuan(),
  new ZiXinSkill(),
  new PeachSkill(),
  new JinkSkill(),
  new HujiaSkill(),
  new JianXiongSkill(),
  new JiJiangSkill(),
  new JiJiangShadowSkill(),
  new JiZhiSkill(),
  new QiCaiSkill(),
  new RendeSkill(),
  new ZhuGeLianNuSlashSkill(),
  new QingGangSkill(),
  new NanManRuQingSkill(),
  new WanJianQiFaSkill(),
];

export class SkillLoader {
  private constructor(private skills: Skill[] = allSkills) {}

  private static instance: SkillLoader;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SkillLoader();
    }

    return this.instance;
  }

  public getAllSkills() {
    return this.skills;
  }

  public getSkillByName<S extends Skill = Skill>(skillName: string): S {
    const skill = this.skills.find(skill => skill.Name === skillName);
    if (skill === undefined) {
      throw new Error(`Unable to get skill ${skillName}`);
    }

    return skill as S;
  }
  public getSkillsByName<S extends Skill = Skill>(skillName: string): S[] {
    const skill = this.skills.filter(skill => skill.Name === skillName);
    if (skill === undefined) {
      throw new Error(`Unable to get skill ${skillName}`);
    }

    return skill as S[];
  }
}
