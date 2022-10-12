import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class DongYun extends Character {
  constructor(id: number) {
    super(id, 'dongyun', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('bingzheng'),
      skillLorderInstance.getSkillByName('sheyan'),
    ]);
  }
}
