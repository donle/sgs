import { INFINITE_DISTANCE } from 'core/game/game_props';
import { DistanceType, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill
export class QiCaiSkill extends RulesBreakerSkill {
  public breakRule(room: Room, owner: PlayerId) {
    room
      .getPlayerById(owner)
      .breakDistanceRules(this.name, INFINITE_DISTANCE, DistanceType.Offense);
  }
}
