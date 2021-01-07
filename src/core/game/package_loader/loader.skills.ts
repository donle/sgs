import { Precondition } from 'core/shares/libs/precondition/precondition';
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

  private addSkills(...skills: SkillPrototype<Skill>[]) {
    for (const skillProto of skills) {
      const skill = new skillProto();
      if (skill.isShadowSkill()) {
        Precondition.assert(
          this.shadowSkills.find(s => s.Name === skill.Name) === undefined,
          `Duplicate shadow skill instance of ${skill.Name}`,
        );

        this.shadowSkills.push(skill);
      } else {
        Precondition.assert(
          this.skills.find(s => s.Name === skill.Name) === undefined,
          `Duplicate skill instance of ${skill.Name}`,
        );

        this.skills.push(skill);
      }
    }
  }

  public getAllSkills() {
    return [...this.skills, ...this.shadowSkills];
  }

  public getSkillByName<S extends Skill = Skill>(skillName: string): S {
    const skill = this.skills.find(skill => skill.Name === skillName);
    return Precondition.exists(skill, `Unable to get skill ${skillName}`) as S;
  }
  public getShadowSkillsByName<S extends Skill = Skill>(skillName: string): S[] {
    const skills = this.shadowSkills.filter(skill => skill.GeneralName === skillName);
    return Precondition.exists(skills, `Unable to get shadow skills ${skillName}`) as S[];
  }
  public getSkillsByName<S extends Skill = Skill>(skillName: string): S[] {
    const skills: S[] = [this.getSkillByName(skillName)];
    const shadowSkills = this.shadowSkills.filter(skill => skill.GeneralName === skillName) as S[];
    if (shadowSkills.length > 0) {
      return [...skills, ...shadowSkills];
    }

    return skills;
  }
}
