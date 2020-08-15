import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Skill } from './skill';

export interface OnDefineReleaseTiming {
  afterLosingSkill?(room: Room, playerId: PlayerId): boolean;
  afterDead?(room: Room, playerId: PlayerId): boolean;
  whenObtainingSkill?(room: Room, player: Player): Promise<void>;
  whenLosingSkill?(room: Room, player: Player): Promise<void>;
  whenDead?(room: Room, player: Player): Promise<void>;
}

export class SkillLifeCycle {
  public static isHookedAfterLosingSkill(skill: Skill) {
    const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
    return hookedSkill.afterLosingSkill;
  }
  public static isHookedAfterDead(skill: Skill) {
    const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
    return hookedSkill.afterDead;
  }
  public static async executeHookOnObtainingSkill(skill: Skill, room: Room, owner: Player) {
    const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
    hookedSkill.whenObtainingSkill && await hookedSkill.whenObtainingSkill(room, owner);
  }
  public static async executeHookOnLosingSkill(skill: Skill, room: Room, owner: Player) {
    const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
    hookedSkill.whenLosingSkill && await hookedSkill.whenLosingSkill(room, owner);
  }
  public static async executeHookedOnDead(skill: Skill, room: Room, owner: Player) {
    const hookedSkill = (skill as unknown) as OnDefineReleaseTiming;
    hookedSkill.whenDead && await hookedSkill.whenDead(room, owner);
  }
}
