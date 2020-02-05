import { Card, VirtualCard } from 'core/cards/card';
import { CardId, RealCardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { UNLIMITED_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, AskForQueryStage, PlayerStageListEnum } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';

export const enum SkillType {
  Common,
  Compulsory,
  Awaken,
  Limit,
}

type SKillConstructor<T extends Skill> = new (
  name: string,
  description: string,
) => T;
function onCalculatingSkillUsageWrapper(
  skillType: SkillType,
  constructor: new () => any,
): any {
  return class extends constructor {
    protected triggeredTimes: number = 0;
    protected skillType = skillType;

    constructor() {
      super();

      if (
        this.skillType === SkillType.Awaken ||
        this.skillType === SkillType.Limit
      ) {
        this.triggeredTimes = 1;
      }
    }

    public async onUse(
      room: Room,
      event: ClientEventFinder<
        GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent
      >,
    ) {
      const result = await super.onUse(room, event);
      this.triggeredTimes++;

      return result;
    }
  } as any;
}

function skillPropertyWrapper(
  options: {
    lordSkill?: boolean;
    shadowSkill?: boolean;
    triggerableTimes?: number;
  },
  constructor: new () => any,
): any {
  return class extends constructor {
    private triggerableTimes: number;
    private lordSkill: boolean;
    private shadowSkill: boolean;

    constructor() {
      super();

      if (options.triggerableTimes !== undefined) {
        this.triggerableTimes = options.triggerableTimes;
      }
      if (options.lordSkill !== undefined) {
        this.lordSkill = options.lordSkill;
      }
      if (options.shadowSkill !== undefined) {
        this.shadowSkill = options.shadowSkill;
      }
    }
  } as any;
}

export function CommonSkill<T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) {
  return onCalculatingSkillUsageWrapper(
    SkillType.Common,
    constructorFunction as any,
  );
}
export function AwakeningSkill<T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) {
  return onCalculatingSkillUsageWrapper(
    SkillType.Awaken,
    constructorFunction as any,
  );
}
export function LimitSkill<T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) {
  return onCalculatingSkillUsageWrapper(
    SkillType.Limit,
    constructorFunction as any,
  );
}
export function CompulsorySkill<T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) {
  return onCalculatingSkillUsageWrapper(
    SkillType.Compulsory,
    constructorFunction as any,
  );
}
export function LordSkill<T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) {
  return skillPropertyWrapper(
    {
      lordSkill: true,
    },
    constructorFunction as any,
  );
}
export function ShadowSkill<T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) {
  return skillPropertyWrapper(
    {
      shadowSkill: true,
    },
    constructorFunction as any,
  );
}
export function TriggerableTimes<T extends Skill>(times: number) {
  return (constructorFunction: SKillConstructor<T>) => {
    return skillPropertyWrapper(
      {
        triggerableTimes: times,
      },
      constructorFunction as any,
    );
  };
}

export abstract class Skill {
  private skillType: SkillType = SkillType.Common;
  private shadowSkill = false;
  private lordSkill = false;

  constructor(protected name: string, protected description: string) {}
  protected triggerableTimes: number = 0;
  private triggeredTimes: number = 0;
  protected abstract isRefreshAt(stage: AllStage): boolean;

  public refresh() {
    this.triggeredTimes = 0;
  }

  public abstract async onUse(
    room: Room,
    event: ClientEventFinder<
      GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent
    >,
  ): Promise<boolean>;

  public abstract onEffect(
    room: Room,
    event: ServerEventFinder<
      GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardUseEvent
    >,
  ): Promise<boolean>;

  public canUse(
    room: Room,
    owner: Player,
    content?: ServerEventFinder<GameEventIdentifiers>,
  ): boolean {
    return this.triggeredTimes < this.triggerableTimes;
  };

  // tslint:disable-next-line: no-empty
  public onLoseSkill(owner: Player) {}

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

  public get SkillType() {
    return this.skillType;
  }
}

export abstract class TriggerSkill extends Skill {
  public abstract isTriggerable(stage: AllStage): boolean;
  public abstract isAutoTrigger(): boolean;
  public abstract async onTrigger(
    room: Room,
    event: ClientEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent
    >,
  ): Promise<boolean>;

  public async onUse(
    room: Room,
    event: ClientEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent
    >,
  ): Promise<boolean> {
    return await this.onTrigger(room, event);
  }

  public abstract async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers>,
  ): Promise<boolean>;

  public isRefreshAt() {
    return false;
  }
}

export abstract class ResponsiveSkill extends TriggerSkill {
  public abstract isTriggerable(stage: AskForQueryStage): boolean;
}

export class DistanceSkill extends Skill {
  protected triggerableTimes: number;

  constructor(name: string, description: string, private distance: number) {
    super(name, description);
    this.triggerableTimes = UNLIMITED_TRIGGERING_TIMES;
  }

  public canUse() {
    return false;
  }
  public isRefreshAt() {
    return false;
  }

  public async onUse() {
    return true;
  }
  public async onEffect() {
    return true;
  }

  public get Distance() {
    return this.distance;
  }
}

export abstract class ActiveSkill extends Skill {
  public abstract targetFilter(room: Room, targets: PlayerId[]): boolean;
  public abstract cardFilter(room: Room, cards: CardId[]): boolean;
  public abstract isAvailableCard(
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
  ): boolean;
  public abstract isAvailableTarget(
    room: Room,
    target: PlayerId,
    selectedTargets: PlayerId[],
  ): boolean;

  public isRefreshAt(stage: AllStage): boolean {
    return stage === PlayerStageListEnum.FinishStageEnd;
  }
}

export abstract class CardTransformSkill<
  C extends Card,
  S extends Skill
> extends Skill {
  public canUse() {
    return false;
  }
  public isRefreshAt() {
    return false;
  }

  public async onEffect() {
    return true;
  }
  public async onUse() {
    return true;
  }

  protected abstract override(skill: S): void;
  public abstract canTransform(card: Card): boolean;
  public clone(card: C): VirtualCard<C> {
    const cloneSkill = Object.assign<S, S>(
      Object.create(Object.getPrototypeOf(card.Skill)),
      card.Skill as S,
    );
    this.override(cloneSkill);

    return VirtualCard.create(card.Name, [card.Id as RealCardId], cloneSkill);
  }
}

export abstract class RulesBreakerSkill extends Skill {
  public canUse() {
    return true;
  }

  public isRefreshAt() {
    return false;
  }

  public async onEffect() {
    return true;
  }
  public async onUse() {
    return true;
  }

  public abstract breakRule(room: Room, playerId: PlayerId): void;
}

export abstract class FilterSkill extends Skill {
  public canUse() {
    return false;
  }
  public isRefreshAt() {
    return false;
  }

  public async onEffect() {
    return true;
  }
  public async onUse() {
    return true;
  }

  public abstract canUseCard(
    cardId: CardId,
    room: Room,
    owner: PlayerId,
    target: PlayerId,
  ): boolean;
  public abstract canBeUsedCard(
    cardId: CardId,
    room: Room,
    owner: PlayerId,
    attacker: PlayerId,
  ): boolean;
}
