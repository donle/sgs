import { RulesBreakerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'chanyuan', description: 'chanyuan_description' })
export class ChanYuan extends RulesBreakerSkill {}
