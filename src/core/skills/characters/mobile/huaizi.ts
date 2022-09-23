import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'huaizi', description: 'huaizi_description' })
export class HuaiZi extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakBaseCardHoldNumber(room: Room, owner: Player) {
    return owner.MaxHp;
  }
}
