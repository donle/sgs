import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'zhuiji', description: 'zhuiji_description' })
export class ZhuiJi extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakDistanceTo(room: Room, owner: Player, target: Player): number {
    return target.Hp <= owner.Hp ? 1 : 0;
  }
}
