import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class XuJing extends Character {
  constructor(id: number) {
    super(id, 'xujing', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.SP, [
      skillLorderInstance.getSkillByName('yuxu'),
      ...skillLorderInstance.getSkillsByName('shijian'),
    ]);
  }
}
