import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class DecadeLuoTong extends Character {
  constructor(id: number) {
    super(id, 'decade_luotong', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('renzheng'),
      ...skillLorderInstance.getSkillsByName('jinjian'),
    ]);
  }
}
