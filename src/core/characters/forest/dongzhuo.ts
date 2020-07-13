import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class DongZhuo extends Character {
  constructor(id: number) {
    super(id, 'dongzhuo', CharacterGender.Male, CharacterNationality.Qun, 8, 8, GameCharacterExtensions.Forest, [
      ...skillLoaderInstance.getSkillsByName('jiuchi'),
      ...skillLoaderInstance.getSkillsByName('roulin'),
      skillLoaderInstance.getSkillByName('benghuai'),
      skillLoaderInstance.getSkillByName('baonve'),
    ]);
  }
}
