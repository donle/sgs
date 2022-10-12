import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class ZhuGeGuo extends Character {
  constructor(id: number) {
    super(id, 'zhugeguo', CharacterGender.Female, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('qirang'),
      skillLorderInstance.getSkillByName('yuhua'),
    ]);
  }
}
