import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesOverrideSkill } from 'core/skills/skill';

export class ZhuGeLianNuSlashSkill extends RulesOverrideSkill {
  public overrideRule(room: Room, owner: PlayerId) {
    room.getPlayerById(owner).cardUseRules.slash = 1000;
  }
}
