import { Card, CardId } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
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
    event: ClientEventFinder<GameEventIdentifiers>,
  ): void;

  public abstract onUse(
    room: Room,
    cardIds?: CardId[],
    targets?: PlayerId[],
  ): void;

  public abstract isAvailable(
    currentPlayer: Player,
    triggerEvent?: GameEventIdentifiers,
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

  public isAvailable(
    currentPlayer: Player,
    triggerEvent: GameEventIdentifiers,
  ) {
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

export class DistanceSkill extends CompulsorySkill {
  constructor(
    name: string,
    description: string,
    private distance: number,
    shadowSkill = false,
    lordSkill = false,
    skillType = SkillType.Compulsory,
  ) {
    super(name, description, shadowSkill, lordSkill, skillType);
  }

  // tslint:disable-next-line:no-empty
  public onEffect() {}

  public get Distance() {
    return this.distance;
  }
}

export abstract class ActiveSkill extends Skill {
  public abstract targetFilter(room: Room, targets: PlayerId[]): boolean;
  public abstract cardFilter(room: Room, cards: CardId[]): boolean;
  public abstract availableCards(
    room: Room,
    cards: CardId[],
    selectedCards?: CardId[],
  ): CardId[];
  public abstract availableTargets(
    room: Room,
    targets: PlayerId[],
    selectedTargets?: PlayerId[],
  ): PlayerId[];

  public get RefreshAt(): AllStage {
    return PlayerStageListEnum.FinishStageEnd;
  }
}

export abstract class AimSkill extends Skill {
  // tslint:disable-next-line: no-empty
  public onUse() {}
  // tslint:disable-next-line: no-empty
  public onEffect() {}

  public isAvailable() {
    return true;
  }
}

export abstract class AimingSKill extends AimSkill {
  public abstract onAiming(room: Room, target: PlayerId, cardId: CardId): void;
}

export abstract class AimmedSkill extends AimSkill {
  public abstract onAimmed(
    room: Room,
    source: PlayerId,
    cardId?: CardId,
    skillName?: string,
  ): void;
}

export abstract class UseCardSkill extends Skill {
  // tslint:disable-next-line: no-empty
  public onUse() {}
  // tslint:disable-next-line: no-empty
  public onEffect() {}

  public isAvailable() {
    return true;
  }

  public abstract useCardRules(history: CardId[]): ((card: Card) => boolean)[];
}
