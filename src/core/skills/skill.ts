import { Card, VirtualCard } from 'core/cards/card';
import { CardId, RealCardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { UNLIMITED_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, PlayerStageListEnum } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';

export const enum SkillType {
  Common,
  Compulsory,
  Awaken,
  Limit,
}

export function CommonSkill(constructorFunction: Function) {
  constructorFunction.prototype.skillType = SkillType.Common;
}
export function AwakeningSkill(constructorFunction: Function) {
  constructorFunction.prototype.skillType = SkillType.Awaken;
}
export function LimitSkill(constructorFunction: Function) {
  constructorFunction.prototype.skillType = SkillType.Limit;
}
export function CompulsorySkill(constructorFunction: Function) {
  constructorFunction.prototype.skillType = SkillType.Compulsory;
}
export function LordSkill(constructorFunction: Function) {
  constructorFunction.prototype.lordSkill = true;
}
export function ShadowSkill(constructorFunction: Function) {
  constructorFunction.prototype.shadowSkill = true;
}

export abstract class Skill {
  protected skillType: SkillType = SkillType.Common;
  private shadowSkill = false;
  private lordSkill = false;

  constructor(protected name: string, protected description: string) {}
  protected triggerableTimes: number = 0;
  protected triggeredTimes: number = 0;
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

  public abstract canUse(
    room: Room,
    owner: Player,
    content?: ClientEventFinder<GameEventIdentifiers>,
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

  public abstract canUse(
    room: Room,
    owner: Player,
    content: ClientEventFinder<GameEventIdentifiers>,
  ): boolean;

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
  constructor(
    name: string,
    description: string,
    private distance: number,
  ) {
    super(name, description);
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
