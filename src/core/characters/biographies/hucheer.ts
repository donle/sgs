import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class HuCheEr extends Character {
  constructor(id: number) {
    super(id, 'hucheer', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Biographies, [
      skillLoaderInstance.getSkillByName('daoji'),
      ...skillLoaderInstance.getSkillsByName('fuzhong'),
    ]);
  }
}
