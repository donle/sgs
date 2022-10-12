import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class CenHun extends Character {
  constructor(id: number) {
    super(id, 'cenhun', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Yuan6, [
      ...skillLoaderInstance.getSkillsByName('jishe'),
      skillLoaderInstance.getSkillByName('lianhuo'),
    ]);
  }
}
