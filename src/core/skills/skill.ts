import { Card, CardId } from 'core/cards/card';
import { AllGameEvent } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStages } from 'core/game/stage';
import { Player } from 'core/player/player';

export const enum SkillType {
  Common,
  Awaken,
  Limit,
}

export abstract class Skill {
  constructor(
    protected name: string,
    protected description: string,
    private shadowSkill = false,
    private lordSkill = false,
    protected skillType = SkillType.Common,
  ) {}
  protected triggeredTimes: number = 0;
  public abstract onEffect(engine: Sanguosha, cardIds: CardId[]): void;

  public abstract isAvailable(
    currentPlayer: Player,
    triggerEvent?: AllGameEvent,
  ): boolean;

  public refresh() {
    if (this.skillType === SkillType.Common) {
      this.triggeredTimes = 0;
    }
  }

  public hasUsed() {
    return this.triggeredTimes > 0;
  }

  public skillUsed() {
    this.triggeredTimes++;
  }

  public get Description() {
    return this.description;
  }

  public get Name() {
    return this.name;
  }

  public get isLordSkill() {
    return this.lordSkill;
  }

  public get isShadowSkill() {
    return this.shadowSkill;
  }
}

export abstract class TriggerSkill extends Skill {
  protected abstract triggerStages: AllStages[];

  public isTriggerable(stage: AllStages): boolean {
    return this.triggerStages.includes(stage);
  }

  public isAvailable(currentPlayer: Player, triggerEvent: AllGameEvent) {
    return true;
  }
}

export abstract class CompulsorySkill extends Skill {
  public isAvailable() {
    return true;
  }
}

export abstract class ActiveSkill extends Skill {
  public abstract onUseFilter(
    engine: Sanguosha,
    cardIds: CardId[],
  ): SkillFilterResponse;

  public abstract isAutoActivate(): boolean;
}

export type SkillFilterResponse = {
  availableTargets?: Player[];
  availableCards?: CardId[];
  targetsRestriction?(targets?: Player): boolean;
  cardsRestriction?(cards?: Card): boolean;
};
