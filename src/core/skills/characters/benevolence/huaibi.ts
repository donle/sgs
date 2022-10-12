import { YaoHu } from './yaohu';
import { CharacterNationality } from 'core/characters/character';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill } from 'core/skills/skill';
import { CompulsorySkill, LordSkill } from 'core/skills/skill_wrappers';

@LordSkill
@CompulsorySkill({ name: 'huaibi', description: 'huaibi_description' })
export class HuaiBi extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    const nationality = owner.getFlag<CharacterNationality>(YaoHu.Name);
    return nationality !== undefined
      ? room.AlivePlayers.filter(player => player.Nationality === nationality).length
      : 0;
  }
}
