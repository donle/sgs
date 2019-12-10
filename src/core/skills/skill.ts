import { Card, CardId } from 'core/cards/card';
import {
  AllGameEvent,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Room } from 'core/game/room';
import { AllStage, GameEventStage, PlayerStage } from 'core/game/stage';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';

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
  protected abstract get RefreshAt(): AllStage | undefined;

  public abstract onEffect(
    room: Room,
    skillUseEvent: ClientEventFinder<
      GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent
    >,
  ): void;

  public abstract onUse(
    room: Room,
    cardIds?: CardId[],
    targets?: PlayerId[],
  ): void;

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
  protected abstract triggerStages: AllStage[];

  public isTriggerable(stage: AllStage): boolean {
    return this.triggerStages.includes(stage);
  }

  public isAvailable(currentPlayer: Player, triggerEvent: AllGameEvent) {
    return true;
  }
}

export abstract class CompulsorySkill extends Skill {
  public get TriggerStage(): AllStage | undefined {
    return;
  }

  public get RefreshAt(): undefined {
    return;
  }

  public isAvailable() {
    return true;
  }

  // tslint:disable-next-line: no-empty
  public onUse() {}
}

export abstract class ActiveSkill extends Skill {
  public abstract targetFilter(room: Room, targets: PlayerId[]): boolean;
  public abstract cardFilter(room: Room, cards: CardId[]): boolean;
  public abstract isAutoActivate(): boolean;
  public abstract availableCards(room: Room, cards: CardId[]): CardId[];

  public get RefreshAt(): AllStage {
    return PlayerStage.FinishStageEnd;
  }
}
