import { Card, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, PlayerStageListEnum } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TranslationPack } from 'core/translations/translation_json_tool';

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
      room.getPlayerById(event.fromId).useSkill(this.name);

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
  protected abstract isRefreshAt(stage: AllStage): boolean;

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

  public abstract canUse(
    room: Room,
    owner: Player,
    content?: ServerEventFinder<GameEventIdentifiers>,
  ): boolean;

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

export class DistanceSkill extends Skill {
  protected triggerableTimes: number;

  constructor(name: string, description: string, private distance: number) {
    super(name, description);
    this.triggerableTimes = INFINITE_TRIGGERING_TIMES;
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

export abstract class ViewAsSkill extends Skill {
  public canUse() {
    return false;
  }

  public isRefreshAt() {
    return false;
  }

  public abstract canViewAs(): string[];

  public abstract targetFilterFor(
    cardName: string,
    room: Room,
    targets: PlayerId[],
  ): boolean;
  public abstract cardFilterFor(
    cardName: string,
    room: Room,
    cards: CardId[],
  ): boolean;
  public abstract isAvailableCardFor(
    cardName: string,
    room: Room,
    pendingCardId: CardId,
    selectedCards: CardId[],
  ): boolean;

  public abstract isAvailableTargetFor(
    cardName: string,
    room: Room,
    pendingTargetId: PlayerId,
    selectedTargets: PlayerId[],
  ): boolean;

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    let validTarget = false;
    for (const cardName of this.canViewAs()) {
      validTarget =
        validTarget || this.targetFilterFor(cardName, room, targets);
    }

    return validTarget;
  }

  public cardFilter(room: Room, cards: CardId[]): boolean {
    let validCard = false;
    for (const cardName of this.canViewAs()) {
      validCard = validCard || this.cardFilterFor(cardName, room, cards);
    }

    return validCard;
  }
  public isAvailableCard(
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
  ): boolean {
    let validCard = false;
    for (const cardName of this.canViewAs()) {
      validCard =
        validCard ||
        this.isAvailableCardFor(cardName, room, cardId, selectedCards);
    }

    return validCard;
  }

  public isAvailableTarget(
    room: Room,
    target: PlayerId,
    selectedTargets: PlayerId[],
  ): boolean {
    let validTarget = false;
    for (const cardName of this.canViewAs()) {
      const card = Sanguosha.getCardByName(cardName);
      validTarget =
        validTarget ||
        this.isAvailableTargetFor(cardName, room, target, selectedTargets);
    }

    return validTarget;
  }

  public async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates skill {1}',
      room.getPlayerById(event.fromId).Name,
      this.name,
    );

    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const cardUseEvent = triggeredOnEvent as ClientEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;

    const identifier = EventPacker.getIdentifier(cardUseEvent);
    const card: VirtualCard<Card> = Sanguosha.getCardById(cardUseEvent.cardId);
    if (!card.isVirtualCard() || identifier === undefined) {
      throw new Error(`Invalid view as virtual card in ${this.name}`);
    }

    await room.Processor.onHandleIncomingEvent(identifier, cardUseEvent);
    return true;
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
