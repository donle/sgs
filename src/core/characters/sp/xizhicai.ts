import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class XiZhiCai extends Character {
  constructor(id: number) {
    super(id, 'xizhicai', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('tiandu'),
      ...skillLorderInstance.getSkillsByName('xianfu'),
      skillLorderInstance.getSkillByName('chouce'),
    ]);
  }
}
