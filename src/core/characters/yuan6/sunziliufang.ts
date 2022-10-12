import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class SunZiLiuFang extends Character {
  constructor(id: number) {
    super(id, 'sunziliufang', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Yuan6, [
      skillLoaderInstance.getSkillByName('guizao'),
      ...skillLoaderInstance.getSkillsByName('jiyu'),
    ]);
  }
}
