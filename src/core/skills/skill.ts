import { Card, CardId, VirtualCard } from 'core/cards/card';
import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { AllStage, PlayerStageListEnum } from 'core/game/stage';
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

  public abstract onEffect(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers>,
  ): void;

  public abstract canUse(
    room: Room,
    owner: Player,
    content?: ClientEventFinder<GameEventIdentifiers>,
  ): boolean;

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
  public abstract onTrigger<
    I extends GameEventIdentifiers = GameEventIdentifiers
  >(
    room: Room,
    owner: Player,
    content?: EventPicker<I, WorkPlace.Server>,
  ): void;

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
  public onUse() {}
  // tslint:disable-next-line:no-empty
  public onEffect() {}

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
  public abstract onUse(
    room: Room,
    owner: PlayerId,
    cardIds?: CardId[],
    targets?: PlayerId[],
  ): void;

  public isRefreshAt(stage: AllStage): boolean {
    return stage === PlayerStageListEnum.FinishStageEnd;
  }
}

export abstract class ViewAsSkill<S extends SkillType> extends ActiveSkill<S> {
  protected abstract viewAsCard: VirtualCard<Card>;
  public abstract viewAs<T extends Card>(cardName: string): T;

  public getViewAsCard<T extends Card>(): VirtualCard<T> {
    return this.viewAsCard as VirtualCard<T>;
  }
}

export abstract class FilterSkill extends Skill<SkillType.Compulsory> {
  public canUse() {
    return false;
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
