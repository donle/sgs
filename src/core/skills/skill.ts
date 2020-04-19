import { Card, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPicker,
  EventProcessSteps,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { AllStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';

export const enum SkillType {
  Common,
  Compulsory,
  Awaken,
  Limit,
}

type SKillConstructor<T extends Skill> = new (name: string, description: string) => T;
function onCalculatingSkillUsageWrapper(skillType: SkillType, constructor: new () => any): any {
  return class extends constructor {
    protected skillType = skillType;

    constructor() {
      super();

      if (this.skillType === SkillType.Awaken || this.skillType === SkillType.Limit) {
        this.isRefreshAt = () => false;
        const canUseResult = this.canUse;
        this.canUse = (room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers>) =>
          !owner.hasUsedSkill(this.name) && canUseResult(room, owner, content);
      }
    }

    public async onUse(
      room: Room,
      event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
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
    uniqueSkill?: boolean;
    selfTargetSkill?: boolean;
  },
  constructor: new () => any,
): any {
  return class extends constructor {
    private lordSkill: boolean;
    private shadowSkill: boolean;
    private uniqueSkill: boolean;
    private selfTargetSkill: boolean;
    private name: string;

    public canUse: (room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers>) => boolean;

    constructor() {
      super();

      if (options.lordSkill !== undefined) {
        this.lordSkill = options.lordSkill;
        const canUseResult = this.canUse;

        this.canUse = (room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers>) =>
          owner.Role === PlayerRole.Lord && canUseResult(room, owner, content);
      }
      if (options.shadowSkill !== undefined) {
        this.shadowSkill = options.shadowSkill;
        this.name = '#' + this.name;
      }
      if (options.uniqueSkill !== undefined) {
        this.uniqueSkill = options.uniqueSkill;
      }
      if (options.selfTargetSkill !== undefined) {
        this.selfTargetSkill = options.selfTargetSkill;
      }
    }
  } as any;
}

export function CommonSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return onCalculatingSkillUsageWrapper(SkillType.Common, constructorFunction as any);
}
export function AwakeningSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return onCalculatingSkillUsageWrapper(SkillType.Awaken, constructorFunction as any);
}
export function LimitSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return onCalculatingSkillUsageWrapper(SkillType.Limit, constructorFunction as any);
}
export function CompulsorySkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return onCalculatingSkillUsageWrapper(SkillType.Compulsory, constructorFunction as any);
}
export function LordSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return skillPropertyWrapper(
    {
      lordSkill: true,
    },
    constructorFunction as any,
  );
}
export function SelfTargetSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return skillPropertyWrapper(
    {
      selfTargetSkill: true,
    },
    constructorFunction as any,
  );
}
export function ShadowSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return skillPropertyWrapper(
    {
      shadowSkill: true,
    },
    constructorFunction as any,
  );
}
export function UniqueSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return skillPropertyWrapper(
    {
      uniqueSkill: true,
    },
    constructorFunction as any,
  );
}

export type SkillPrototype<T extends Skill> = new () => T;

export abstract class Skill {
  private skillType: SkillType = SkillType.Common;
  private shadowSkill = false;
  private lordSkill = false;
  private uniqueSkill = false;
  private selfTargetSkill = false;

  constructor(protected name: string, protected description: string) {}
  public abstract isRefreshAt(stage: PlayerPhase): boolean;

  public abstract async onUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): Promise<boolean>;

  public abstract onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
  ): Promise<boolean>;

  public abstract canUse(
    room: Room,
    owner: Player,
    contentOrContainerCard?: ServerEventFinder<GameEventIdentifiers> | CardId,
  ): boolean;

  public async onEffectRejected(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
    // tslint:disable-next-line: no-empty
  ) {}

  public async beforeEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
    // tslint:disable-next-line: no-empty
  ) {
    return true;
  }
  public async afterEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
    // tslint:disable-next-line: no-empty
  ) {
    return true;
  }

  // tslint:disable-next-line: no-empty
  public onLoseSkill(owner: Player) {}
  public getAnimationSteps(
    event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): EventProcessSteps {
    return event.toIds ? [{ from: event.fromId, tos: event.toIds }] : [];
  }

  public get Description() {
    return this.description;
  }

  public get Name() {
    return this.name;
  }

  public get GeneralName() {
    return this.name.replace(/^#+/, '');
  }

  public isLordSkill() {
    return this.lordSkill;
  }

  public isShadowSkill() {
    return this.shadowSkill;
  }

  public isUniqueSkill() {
    return this.uniqueSkill;
  }

  public isSelfTargetSkill() {
    return this.selfTargetSkill;
  }

  public get SkillType() {
    return this.skillType;
  }
}

export abstract class ResponsiveSkill extends Skill {
  public canUse() {
    return false;
  }

  public isRefreshAt() {
    return false;
  }

  public abstract responsiveFor(): CardMatcher;

  public abstract async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>,
  ): Promise<boolean>;

  public abstract onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent | GameEventIdentifiers.CardEffectEvent>,
  ): Promise<boolean>;
}

export abstract class TriggerSkill extends Skill {
  public abstract isTriggerable(event: EventPicker<GameEventIdentifiers, WorkPlace>, stage?: AllStage): boolean;
  public isAutoTrigger(event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return false;
  }

  public abstract async onTrigger(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean>;
  public abstract canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers>): boolean;

  public async onUse(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    return await this.onTrigger(room, event);
  }

  public abstract async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers>): Promise<boolean>;

  public isRefreshAt() {
    return false;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }
  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 0;
  }
  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return false;
  }
  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return false;
  }
}

export abstract class ActiveSkill extends Skill {
  public abstract targetFilter(room: Room, targets: PlayerId[]): boolean;
  public abstract cardFilter(room: Room, cards: CardId[]): boolean;
  public abstract canUse(room: Room, owner: Player): boolean;
  public abstract isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean;
  public abstract isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean;

  public isRefreshAt(phase: PlayerPhase) {
    return phase === PlayerPhase.PrepareStage;
  }
}

export abstract class TransformSkill extends Skill {
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

  public includesJudgeCard() {
    return false;
  }

  public abstract get Place(): (PlayerCardsArea.HandArea | PlayerCardsArea.EquipArea)[];

  public abstract forceToTransformCardTo(cardId: CardId): VirtualCard | Card;
}

export abstract class ViewAsSkill extends Skill {
  public isRefreshAt() {
    return false;
  }

  public abstract canUse(
    room: Room,
    owner: Player,
    contentOrContainerCard?: ServerEventFinder<GameEventIdentifiers> | CardId,
  ): boolean;

  public abstract canViewAs(): string[];
  public abstract viewAs(cards: CardId[]): VirtualCard;
  public abstract cardFilter(room: Room, owner: Player, cards: CardId[]): boolean;
  public abstract isAvailableCard(
    room: Room,
    owner: Player,
    pendingCardId: CardId,
    selectedCards: CardId[],
    containerCard?: CardId,
    cardMatcher?: CardMatcher,
  ): boolean;

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
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

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    return 0;
  }
  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    return 0;
  }
  public breakCardUsableTargets(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    return 0;
  }
  public breakAttackDistance(cardId: CardId | CardMatcher | undefined, room: Room, owner: Player): number {
    return 0;
  }
  public breakOffenseDistance(room: Room, owner: Player): number {
    return 0;
  }
  public breakDefenseDistance(room: Room, owner: Player): number {
    return 0;
  }
  public breakBaseCardHoldNumber(room: Room, owner: Player): number {
    return 0;
  }
}

export abstract class FilterSkill extends Skill {
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

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, target?: PlayerId): boolean {
    return true;
  }
  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    return true;
  }
}
