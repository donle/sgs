import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class HuaTuo extends Character {
  constructor(id: number) {
    super(id, 'huatuo', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('jijiu'),
      ...skillLoaderInstance.getSkillsByName('qingnang'),
    ]);
  }
}
