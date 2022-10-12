import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class MaLiang extends Character {
  constructor(id: number) {
    super(id, 'maliang', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.SP, [
      ...skillLorderInstance.getSkillsByName('zishu'),
      ...skillLorderInstance.getSkillsByName('yingyuan'),
    ]);
  }
}
