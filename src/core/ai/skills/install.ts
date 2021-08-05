import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { ActiveSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { AiSkillTrigger } from '../ai_skill_trigger';
import { ActiveSkillTriggerClass } from './base/active_skill_trigger';
import { TriggerSkillTriggerClass } from './base/trigger_skill_trigger';
import { ViewAsSkillTriggerClass } from './base/view_as_skill_trigger';
import { activeSkillTriggerMapper, triggerSkillTriggerMapper, viewAsSkillTriggerMapper } from './install_list';

export function installViewAskillTriggers() {
  const viewAsSkills = SkillLoader.getInstance()
    .getAllSkills()
    .filter(skill => skill instanceof ViewAsSkill) as ViewAsSkill[];

  const triggerInstance = new ViewAsSkillTriggerClass();
  for (const skill of viewAsSkills) {
    if (triggerSkillTriggerMapper[skill.Name]) {
      AiSkillTrigger.installViewAsSkillTrigger(skill, viewAsSkillTriggerMapper[skill.Name]);
    } else {
      AiSkillTrigger.installViewAsSkillTrigger(skill, triggerInstance);
    }
  }
}

export function installTriggerskillTriggers() {
  const triggerSkills = SkillLoader.getInstance()
    .getAllSkills()
    .filter(skill => skill instanceof TriggerSkill) as TriggerSkill[];

  const triggerInstance = new TriggerSkillTriggerClass();
  for (const skill of triggerSkills) {
    if (triggerSkillTriggerMapper[skill.Name]) {
      AiSkillTrigger.installTriggerSkillTrigger(skill, triggerSkillTriggerMapper[skill.Name]);
    } else {
      AiSkillTrigger.installTriggerSkillTrigger(skill, triggerInstance);
    }
  }
}

export function installActiveSkillTriggers() {
  const triggerSkills = SkillLoader.getInstance()
    .getAllSkills()
    .filter(skill => skill instanceof ActiveSkill) as ActiveSkill[];

  const triggerInstance = new ActiveSkillTriggerClass();
  for (const skill of triggerSkills) {
    if (activeSkillTriggerMapper[skill.Name]) {
      AiSkillTrigger.installActiveSkillTrigger(skill, activeSkillTriggerMapper[skill.Name]);
    } else {
      AiSkillTrigger.installActiveSkillTrigger(skill, triggerInstance);
    }
  }
}
