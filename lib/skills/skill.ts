import { Card } from 'cards/card';
import { Character } from 'characters/character';

export abstract class Skill {
  constructor(protected name: string, protected description: string) {}
}

export abstract class TriggerSkill extends Skill {
  private triggerable = false;
  public abstract onTrigger(): boolean;

  public get Triggerable() {
    return this.triggerable;
  }

  public set Triggerable(triggerable: boolean) {
    this.triggerable = triggerable;
  }
}

export abstract class CompulsorySkill extends Skill {
  public abstract onEffect(): void;
}

export abstract class ActiveSkill extends Skill {}
