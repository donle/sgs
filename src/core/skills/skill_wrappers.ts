import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Skill, SkillType } from './skill';

type SKillConstructor<T extends Skill> = new () => T;
function onCalculatingSkillUsageWrapper(
  skillType: SkillType,
  name: string,
  description: string,
  constructor: new () => any,
): any {
  return class WrappedSkillConstructor extends constructor {
    protected skillType = skillType;
    private canUseEntity: (room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers>) => boolean;
    private description = description;
    private skillName = name;

    public static get Description() {
      return description;
    }
    public static get GeneralName() {
      return name.replace(/#+/, '');
    }
    public static get Name() {
      return name;
    }

    constructor() {
      super();

      if (this.skillType === SkillType.Awaken || this.skillType === SkillType.Limit) {
        this.isRefreshAt = () => false;
        this.canUseEntity = this.canUse;
        this.canUse = (room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers>) =>
          !owner.hasUsedSkill(this.Name) && this.canUseEntity(room, owner, content);
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
    statusSkill?: boolean;
    shadowSkill?: boolean;
    uniqueSkill?: boolean;
    selfTargetSkill?: boolean;
  },
  constructor: new () => any,
): any {
  return class WrappedSkillConstructor extends constructor {
    private lordSkill: boolean;
    private shadowSkill: boolean;
    private uniqueSkill: boolean;
    private selfTargetSkill: boolean;
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
        this.skillName = '#' + this.skillName;
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

export const CommonSkill = (skill: { name: string; description: string }) => <T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) => {
  return onCalculatingSkillUsageWrapper(SkillType.Common, skill.name, skill.description, constructorFunction as any);
};
export const AwakeningSkill = (skill: { name: string; description: string }) => <T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) => {
  return onCalculatingSkillUsageWrapper(SkillType.Awaken, skill.name, skill.description, constructorFunction as any);
};
export const LimitSkill = (skill: { name: string; description: string }) => <T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) => {
  return onCalculatingSkillUsageWrapper(SkillType.Limit, skill.name, skill.description, constructorFunction as any);
};
export const CompulsorySkill = (skill: { name: string; description: string }) => <T extends Skill>(
  constructorFunction: SKillConstructor<T>,
) => {
  return onCalculatingSkillUsageWrapper(
    SkillType.Compulsory,
    skill.name,
    skill.description,
    constructorFunction as any,
  );
};
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
export const ShadowSkill = <T extends Skill>(constructorFunction: SKillConstructor<T>) => {
  const WrappedConstructor = skillPropertyWrapper(
    {
      shadowSkill: true,
    },
    constructorFunction as new () => any,
  );

  return class extends WrappedConstructor {
    public static get Name() {
      return '#' + super.Name;
    }
  } as any;
};
export function UniqueSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return skillPropertyWrapper(
    {
      uniqueSkill: true,
    },
    constructorFunction as any,
  );
}

export type SkillPrototype<T extends Skill> = new () => T;
