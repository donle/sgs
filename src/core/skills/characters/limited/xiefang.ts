import { CharacterGender } from 'core/characters/character';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'xiefang', description: 'xiefang_description' })
export class XieFang extends RulesBreakerSkill {
  public audioIndex(): number {
    return 0;
  }

  public breakOffenseDistance(room: Room, owner: Player): number {
    return room.getAllPlayersFrom().filter(player => player.Gender === CharacterGender.Female).length;
  }
}
