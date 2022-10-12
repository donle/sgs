import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class ZhouFei extends Character {
  constructor(id: number) {
    super(id, 'zhoufei', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Thunder, [
      ...skillLoaderInstance.getSkillsByName('liangyin'),
      ...skillLoaderInstance.getSkillsByName('kongsheng'),
    ]);
  }
}
