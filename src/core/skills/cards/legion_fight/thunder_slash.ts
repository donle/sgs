import { SlashSkill } from '../standard/slash';
import { SlashSkillTrigger } from 'core/ai/skills/cards/slash';
import { DamageType } from 'core/game/game_props';
import { AI, CommonSkill } from 'core/skills/skill';

@AI(SlashSkillTrigger)
@CommonSkill({ name: 'thunder_slash', description: 'thunder_slash_description' })
export class ThunderSlashSkill extends SlashSkill {
  public readonly damageType: DamageType = DamageType.Thunder;
}
