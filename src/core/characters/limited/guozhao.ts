import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class GuoZhao extends Character {
  constructor(id: number) {
    super(id, 'guozhao', CharacterGender.Female, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('pianchong'),
      skillLorderInstance.getSkillByName('zunwei'),
    ]);
  }
}
