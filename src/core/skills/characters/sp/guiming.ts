import { Skill } from 'core/skills/skill';
import { CompulsorySkill, LordSkill } from 'core/skills/skill_wrappers';

@LordSkill
@CompulsorySkill({ name: 'guiming', description: 'guiming_description' })
export class GuiMing extends Skill {
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
