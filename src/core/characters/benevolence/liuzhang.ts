import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class LiuZhang extends Character {
  constructor(id: number) {
    super(id, 'liuzhang', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Benevolence, [
      skillLoaderInstance.getSkillByName('jutu'),
      ...skillLoaderInstance.getSkillsByName('yaohu'),
      skillLoaderInstance.getSkillByName('huaibi'),
    ]);
  }
}
