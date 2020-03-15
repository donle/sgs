import * as SkillList from 'core/skills';
import { Skill, SkillPrototype } from 'core/skills/skill';

export class SkillLoader {
  private constructor(private skills: Skill[] = [], private shadowSkills: Skill[] = []) {}

  private static instance: SkillLoader;

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SkillLoader();
      this.instance.addSkills(...Object.values(SkillList));
    }

    return this.instance;
  }

  public addSkills(...skills: SkillPrototype<Skill>[]) {
    for (const skillProto of skills) {
      const skill = new skillProto();
      if (skill.isShadowSkill()) {
        if (this.shadowSkills.find(s => s.Name === skill.Name)) {
          throw new Error(`Duplicate shadow skill instance of ${skill.Name}`);
        }
        this.shadowSkills.push(skill);
      } else {
        if (this.skills.find(s => s.Name === skill.Name)) {
          throw new Error(`Duplicate skill instance of ${skill.Name}`);
        }
        this.skills.push(skill);
      }
    }
  }

  public getAllSkills() {
    return [...this.skills, ...this.shadowSkills];
  }

  public getSkillByName<S extends Skill = Skill>(skillName: string): S {
    const skill = this.skills.find(skill => skill.Name === skillName);
    if (skill === undefined) {
      throw new Error(`Unable to get skill ${skillName}`);
    }

    return skill as S;
  }
  public getSkillsByName<S extends Skill = Skill>(skillName: string): S[] {
    const skills: S[] = [this.getSkillByName(skillName)];
    const shadowSkills = this.shadowSkills.filter(skill => skill.Name === skillName) as S[];
    if (shadowSkills.length > 0) {
      return [...skills, ...shadowSkills];
    }

    return skills;
  }
}
