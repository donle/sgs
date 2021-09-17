import { CharacterNationality } from 'core/characters/character';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { GlobalRulesBreakerSkill } from 'core/skills/skill';
import { CompulsorySkill, LordSkill } from 'core/skills/skill_wrappers';

@LordSkill
@CompulsorySkill({ name: 'zhaofu', description: 'zhaofu_description' })
export class ZhaoFu extends GlobalRulesBreakerSkill {
  public breakWithinAttackDistance(room: Room, owner: Player, from: Player, to: Player): boolean {
    return room.distanceBetween(owner, to) === 1 && from !== owner && from.Nationality === CharacterNationality.Wu;
  }
}
