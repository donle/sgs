import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class LuYuSheng extends Character {
  constructor(id: number) {
    super(id, 'luyusheng', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Decade, [
      skillLorderInstance.getSkillByName('zhente'),
      ...skillLorderInstance.getSkillsByName('zhiwei'),
    ]);
  }
}
