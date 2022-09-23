import { BaseSkillTrigger } from 'core/ai/skills/base/base_trigger';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
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
        this.canUse = (room: Room, owner: Player, content?: ServerEventFinder<GameEventIdentifiers>) =>
          !owner.hasUsedSkill(this.Name) && super.canUse(room, owner, content);
      }
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
    sideEffectSkill?: boolean;
    persistentSkill?: boolean;
    circleSkill?: boolean;
    stubbornSkill?: boolean;
    switchSkill?: boolean;
    switchable?: boolean;
    ai?: typeof BaseSkillTrigger;
  },
  constructor: new () => any,
): any {
  return class WrappedSkillConstructor extends constructor {
    constructor() {
      super();

      if (options.lordSkill !== undefined) {
        this.lordSkill = options.lordSkill;
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
      if (options.sideEffectSkill !== undefined) {
        this.sideEffectSkill = options.sideEffectSkill;
        this.skillName = '~' + this.skillName;
      }
      if (options.persistentSkill !== undefined) {
        this.persistentSkill = options.persistentSkill;
      }
      if (options.stubbornSkill !== undefined) {
        this.stubbornSkill = options.stubbornSkill;
      }
      if (options.circleSkill !== undefined) {
        this.circleSkill = options.circleSkill;
      }
      if (options.switchSkill !== undefined) {
        this.switchSkill = options.switchSkill;
      }
      if (options.switchable !== undefined) {
        this.switchable = options.switchable;
      }
      if (options.ai) {
        this.ai = new options.ai();
      }
    }
  } as any;
}

export const CommonSkill =
  (skill: { name: string; description: string }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    onCalculatingSkillUsageWrapper(SkillType.Common, skill.name, skill.description, constructorFunction as any);
export const PrimarySkill =
  (skill: { name: string; description: string }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    onCalculatingSkillUsageWrapper(SkillType.Primary, skill.name, skill.description, constructorFunction as any);
export const SecondarySkill =
  (skill: { name: string; description: string }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    onCalculatingSkillUsageWrapper(SkillType.Secondary, skill.name, skill.description, constructorFunction as any);
export const AwakeningSkill =
  (skill: { name: string; description: string }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    onCalculatingSkillUsageWrapper(SkillType.Awaken, skill.name, skill.description, constructorFunction as any);
export const LimitSkill =
  (skill: { name: string; description: string }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    onCalculatingSkillUsageWrapper(SkillType.Limit, skill.name, skill.description, constructorFunction as any);
export const CompulsorySkill =
  (skill: { name: string; description: string }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    onCalculatingSkillUsageWrapper(SkillType.Compulsory, skill.name, skill.description, constructorFunction as any);
export const QuestSkill =
  (skill: { name: string; description: string }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    onCalculatingSkillUsageWrapper(SkillType.Quest, skill.name, skill.description, constructorFunction as any);
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

export const PersistentSkill =
  (option?: { stubbornSkill?: boolean }) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    skillPropertyWrapper(
      {
        persistentSkill: true,
        stubbornSkill: option?.stubbornSkill,
      },
      constructorFunction as any,
    );

export function UniqueSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return skillPropertyWrapper(
    {
      uniqueSkill: true,
    },
    constructorFunction as any,
  );
}
export function SideEffectSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  const WrappedConstructor = skillPropertyWrapper(
    {
      sideEffectSkill: true,
    },
    constructorFunction as any,
  );

  return class extends WrappedConstructor {
    public static get Name() {
      return '~' + super.Name;
    }
  } as any;
}

export function CircleSkill<T extends Skill>(constructorFunction: SKillConstructor<T>) {
  return skillPropertyWrapper(
    {
      circleSkill: true,
    },
    constructorFunction as any,
  );
}

export const SwitchSkill =
  (switchable: boolean = true) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    skillPropertyWrapper(
      {
        switchSkill: true,
        switchable,
      },
      constructorFunction as any,
    );

export const AI =
  (instance: typeof BaseSkillTrigger) =>
  <T extends Skill>(constructorFunction: SKillConstructor<T>) =>
    skillPropertyWrapper(
      {
        ai: instance,
      },
      constructorFunction as any,
    );

export type SkillPrototype<T extends Skill> = new () => T;
