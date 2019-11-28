import { Card } from 'core/cards/card';
import { Player } from 'core/player/player';
import { AllStages } from 'core/stage';

export abstract class Skill {
  constructor(
    protected name: string,
    protected description: string,
    private lordSkill = false,
  ) {}
  protected triggeredTimes: number = 0;
  public abstract onEffect(currentPlayer: Player, otherPlayers: Player[], cards: Card[]): void;

  public refresh() {
    this.triggeredTimes = 0;
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
}

export abstract class TriggerSkill extends Skill {
  protected abstract triggerStages: AllStages[];

  public isTriggerable(stage: AllStages): boolean {
    return this.triggerStages.includes(stage);
  }
}

export abstract class CompulsorySkill extends Skill {}

export abstract class ActiveSkill extends Skill {
  public abstract onUseFilter(
    currentPlayer: Player,
    otherPlayers: Player[],
    cards: Card[],
  ): SkillFilterResponse;

  public abstract isAvailable(currentPlayer: Player): boolean;
  public abstract isAutoActivate(): boolean;
}

export type SkillFilterResponse = {
  availableTargets?: Player[];
  availableCards?: Card[];
  targetsRestriction?(targets?: Player): boolean;
  cardsRestriction?(cards?: Card): boolean;
};
