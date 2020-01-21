import { UNLIMITED_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesOverrideSkill } from 'core/skills/skill';

export class ZhuGeLianNuSlashSkill extends RulesOverrideSkill {
  public overrideRule(room: Room, owner: PlayerId) {
    room.getPlayerById(owner).overrideCardUseRules(
      this.name,
      UNLIMITED_TRIGGERING_TIMES,
    );
  }
}
