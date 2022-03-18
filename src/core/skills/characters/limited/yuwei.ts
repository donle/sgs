import { Skill } from 'core/skills/skill';
import { CompulsorySkill, LordSkill } from 'core/skills/skill_wrappers';

@LordSkill
@CompulsorySkill({ name: 'yuwei', description: 'yuwei_description' })
export class YuWei extends Skill {
  public canUse(): boolean {
    return false;
  }

  public isRefreshAt(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(): Promise<boolean> {
    return true;
  }
}
