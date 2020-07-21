import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class LiuShan extends Character {
  constructor(id: number) {
    super(id, 'liushan', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Mountain, [
      skillLoaderInstance.getSkillByName('xiangle'),
<<<<<<< HEAD
      ...skillLoaderInstance.getSkillsByName('fangquan'),
      skillLoaderInstance.getSkillByName('ruoyu'),
=======
>>>>>>> 2a28492... add Character Liushan & Skill Xiangle
    ]);
  }
}
