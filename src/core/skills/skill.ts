import { Card, VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
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

export abstract class Skill<T extends SkillType = SkillType> {
  constructor(
    protected name: string,
    protected description: string,
    protected skillType: T,
    private shadowSkill = false,
    private lordSkill = false,
  ) {}
  protected triggeredTimes: number = 0;
  protected abstract isRefreshAt(stage: AllStage): boolean;

  public abstract async onUse(
    room: Room,
    owner: PlayerId,
    cardIds?: CardId[],
    targets?: PlayerId[],
  ): Promise<void>;
  public abstract onEffect(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers>,
  ): Promise<void> | void;

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

export abstract class TriggerSkill<
  T extends SkillType = SkillType.Common
> extends Skill<T> {
  public abstract isTriggerable(stage: AllStage): boolean;
  public abstract isAutoTrigger(): boolean;
  public abstract onTrigger<
    I extends GameEventIdentifiers = GameEventIdentifiers
  >(
    room: Room,
    owner: Player,
    content?: EventPicker<I, WorkPlace.Server>,
  ): void;
  public abstract async onTrigger(room: Room, owner: Player): Promise<void>;

  public async onUse(
    room: Room,
    owner: PlayerId,
    cardIds?: CardId[],
    targets?: PlayerId[],
  ) {
    await this.onTrigger(room, room.getPlayerById(owner));
  }

  public isRefreshAt() {
    return false;
  }
}

export class DistanceSkill extends Skill<SkillType.Compulsory> {
  constructor(
    name: string,
    description: string,
    private distance: number,
    shadowSkill = false,
    lordSkill = false,
  ) {
    super(name, description, SkillType.Compulsory, shadowSkill, lordSkill);
  }

  public canUse() {
    return false;
  }
  public isRefreshAt() {
    return false;
  }

  // tslint:disable-next-line:no-empty
  public async onUse() {}
  // tslint:disable-next-line:no-empty
  public async onEffect() {}

  public get Distance() {
    return this.distance;
  }
}

export abstract class ActiveSkill<
  T extends SkillType = SkillType.Common
> extends Skill<T> {
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
  S extends Skill,
  T extends SkillType
> extends Skill<T> {
  public canUse() {
    return false;
  }
  public isRefreshAt() {
    return false;
  }
  // tslint:disable-next-line: no-empty
  public async onEffect() {}
  // tslint:disable-next-line: no-empty
  public async onUse() {}

  protected abstract override(skill: S): void;
  public abstract canTransform(card: Card): boolean;
  public clone(card: C): VirtualCard<C> {
    const cloneSkill = Object.assign<S, S>(
      Object.create(Object.getPrototypeOf(card.Skill)),
      card.Skill as S,
    );
    this.override(cloneSkill);

    return VirtualCard.create(card.Name, [card], cloneSkill);
  }
}

export abstract class RulesBreakerSkill extends Skill<SkillType.Common> {
  public canUse() {
    return true;
  }

  public isRefreshAt() {
    return false;
  }

  // tslint:disable-next-line: no-empty
  public async onEffect() {}
  // tslint:disable-next-line: no-empty
  public async onUse() {}

  public abstract breakRule(room: Room, playerId: PlayerId): void;
}

export abstract class FilterSkill extends Skill<SkillType.Compulsory> {
  public canUse() {
    return false;
  }
  public isRefreshAt() {
    return false;
  }
  // tslint:disable-next-line: no-empty
  public async onEffect() {}
  // tslint:disable-next-line: no-empty
  public async onUse() {}

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

export class NullSkill extends Skill<SkillType.Compulsory> {
  constructor() {
    super('null_skill', 'null_skill_description', SkillType.Compulsory);
  }

  public canUse() {
    return false;
  }
  public isRefreshAt() {
    return false;
  }
  // tslint:disable-next-line: no-empty
  public async onEffect() {}
  // tslint:disable-next-line: no-empty
  public async onUse() {}
}
