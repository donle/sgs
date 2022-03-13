import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class BeiMiHu extends Character {
  constructor(id: number) {
    super(id, 'beimihu', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('zongkui'),
      skillLorderInstance.getSkillByName('guju'),
      skillLorderInstance.getSkillByName('baijia'),
    ]);
  }
}
