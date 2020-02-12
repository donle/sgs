import { Skill } from 'core/skills/skill';
import { SkillsList } from 'core/skills/skills_list';

export class SkillLoader {
  private constructor(private skills: Skill[] = SkillsList) {}

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
