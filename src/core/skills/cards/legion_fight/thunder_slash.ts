import { DamageType } from 'core/game/game_props';
import { CommonSkill } from 'core/skills/skill';
import { SlashSkill } from '../standard/slash';

@CommonSkill({ name: 'thunder_slash', description: 'thunder_slash_description' })
export class ThunderSlashSkill extends SlashSkill {
  protected damageType: DamageType = DamageType.Thunder;
}
