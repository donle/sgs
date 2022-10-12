import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class JiangWei extends Character {
  constructor(id: number) {
    super(id, 'jiangwei', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Mountain, [
      ...skillLoaderInstance.getSkillsByName('tiaoxin'),
      skillLoaderInstance.getSkillByName('zhiji'),
    ]);
  }
}
