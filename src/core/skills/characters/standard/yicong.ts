import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'yicong', description: 'yicong_description' })
export class YiCong extends RulesBreakerSkill {
  public breakDefenseDistance(room: Room, owner: Player) {
    return owner.Hp <= 2 ? 1 : 0;
  }

  public breakOffenseDistance(room: Room, owner: Player) {
    return 1;
  }
}
