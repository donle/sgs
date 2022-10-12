import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class SPHuangYueYing extends Character {
  constructor(id: number) {
    super(id, 'sp_huangyueying', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('jiqiao'),
      ...skillLorderInstance.getSkillsByName('linglong'),
    ]);
  }
}
