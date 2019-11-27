import { SkillUseEvent } from 'core/event';
import { GameEventStage } from 'core/stage';

export abstract class Skill {
  constructor(protected name: string, protected description: string) {}
  public abstract onEffect(): SkillUseEvent;

  public get Description() {
    return this.description;
  }
}

export abstract class TriggerSkill extends Skill {
  protected abstract triggerStages: GameEventStage[];

  public isTriggerable(stage: GameEventStage): boolean {
    return this.triggerStages.includes(stage);
  }
}

export abstract class CompulsorySkill extends Skill {}

export abstract class ActiveSkill extends Skill {
  public abstract isAvailable(): boolean;
}
