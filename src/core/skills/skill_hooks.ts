import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Skill } from './skill';

export interface OnDefineReleaseTiming {
  onLosingSkill?(room: Room, playerId: PlayerId): boolean;
  onDeath?(room: Room, playerId: PlayerId): boolean;
}

export class SkillHooks {
  public static isHookedUpOnLosingSkill(skill: Skill) {
    return ((skill as unknown) as OnDefineReleaseTiming).onLosingSkill;
  }
  public static isHookedUpOnDeath(skill: Skill) {
    return ((skill as unknown) as OnDefineReleaseTiming).onDeath;
  }
}
