import { SlashSkill } from '../standard/slash';
import { SlashSkillTrigger } from 'core/ai/skills/cards/slash';
import { DamageType } from 'core/game/game_props';
import { AI, CommonSkill } from 'core/skills/skill';

@AI(SlashSkillTrigger)
@CommonSkill({ name: 'fire_slash', description: 'fire_slash_description' })
export class FireSlashSkill extends SlashSkill {
  public readonly damageType: DamageType = DamageType.Fire;
}
