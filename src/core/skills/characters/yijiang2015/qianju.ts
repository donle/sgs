import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'qianju', description: 'qianju_description' })
export class QianJu extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakOffenseDistance(room: Room, owner: Player): number {
    return owner.LostHp;
  }
}
