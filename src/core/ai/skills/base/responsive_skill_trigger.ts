import type { GameEventIdentifiers } from 'core/event/event';
import type { ResponsiveSkill } from 'core/skills/skill';
import { BaseSkillTrigger } from './base_trigger';

export class ResponsiveSkillTriggerClass<
  T extends ResponsiveSkill = ResponsiveSkill,
  I extends GameEventIdentifiers = GameEventIdentifiers
> extends BaseSkillTrigger {}
