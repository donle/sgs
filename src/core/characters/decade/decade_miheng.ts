import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

export class DecadeMiHeng extends Character {
  constructor(id: number) {
    super(id, 'decade_miheng', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Decade, [
      ...skillLorderInstance.getSkillsByName('decade_kuangcai'),
      skillLorderInstance.getSkillByName('decade_shejian'),
    ]);
  }
}
