import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class RuanYu extends Character {
  constructor(id: number) {
    super(id, 'ruanyu', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('xingzuo'),
      ...skillLorderInstance.getSkillsByName('miaoxian'),
    ]);
  }
}
