import { JiuYuan } from 'core/skills/characters/standard/jiuyuan';
import { PeachSkill } from 'core/skills/characters/standard/peach';
import { SlashSkill } from 'core/skills/characters/standard/slash';
import { ZhiHeng } from 'core/skills/characters/standard/zhiheng';
import { ZiXinSkill } from 'core/skills/characters/standard/zixin';
import { Skill } from 'core/skills/skill';

const allSkills = [
    new SlashSkill(),
    new ZhiHeng(),
    new JiuYuan(),
    new ZiXinSkill(),
    new PeachSkill(),
];

export class SkillLoader {
  private constructor(private skills: Skill[] = allSkills) {
  }

  private static instance: SkillLoader;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SkillLoader();
    }

    return this.instance;
  }

  public getSkillByName<S extends Skill = Skill>(skillName: string): S {
      const skill = this.skills.find(skill => skill.Name === skillName);
      if (skill === undefined) {
          throw new Error(`Unable to get skill ${skillName}`);
      }

      return skill as S;
  }
}
