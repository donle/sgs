import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class ZhangJiao extends Character {
  constructor(id: number) {
    super(id, 'zhangjiao', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Wind, [
      skillLoaderInstance.getSkillByName('guidao'),
      ...skillLoaderInstance.getSkillsByName('leiji'),
      skillLoaderInstance.getSkillByName('huangtian'),
    ]);
  }
}
