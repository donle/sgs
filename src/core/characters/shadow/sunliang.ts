import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class SunLiang extends Character {
  constructor(id: number) {
    super(id, 'sunliang', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Shadow, [
      skillLoaderInstance.getSkillByName('kuizhu'),
      ...skillLoaderInstance.getSkillsByName('chezheng'),
      skillLoaderInstance.getSkillByName('lijun'),
    ]);
  }
}
