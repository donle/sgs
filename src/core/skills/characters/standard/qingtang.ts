import { CompulsorySkill, Skill, UniqueSkill } from 'core/skills/skill';

@UniqueSkill
@CompulsorySkill
export class QingGangSkill extends Skill {
  constructor() {
    super('qinggang', 'qinggang_description');
  }

  canUse() {
    return true;
  }

  isRefreshAt() {
    return false;
  }

  async onUse() {
    return true;
  }
  async onEffect() {
    return true;
  }
}
