import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhiSunShao extends Character {
  constructor(id: number) {
    super(id, 'zhi_sunshao', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('fubi'),
      ...skillLorderInstance.getSkillsByName('zuici'),
    ]);
  }
}
